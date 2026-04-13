import { ref, reactive, computed } from 'vue'

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}

const inCall = ref(false)
const audioEnabled = ref(true)
const videoEnabled = ref(true)
const screenSharing = ref(false)
const localStream = ref(null)
const peerConnections = {}
const remoteStreams = reactive({})

export function useWebRTC(sendSignal, nickname, users) {

  const videoCount = computed(() => 1 + Object.keys(remoteStreams).length)

  function createPeer(remoteNick) {
    const pc = new RTCPeerConnection(rtcConfig)
    peerConnections[remoteNick] = pc

    if (localStream.value) {
      localStream.value.getTracks().forEach(track => {
        pc.addTrack(track, localStream.value)
      })
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'ice',
          nickname: nickname.value,
          target: remoteNick,
          candidate: event.candidate
        })
      }
    }

    pc.ontrack = (event) => {
      remoteStreams[remoteNick] = event.streams[0]
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        removePeer(remoteNick)
      }
    }

    return pc
  }

  function removePeer(nick) {
    if (peerConnections[nick]) {
      peerConnections[nick].close()
      delete peerConnections[nick]
    }
    delete remoteStreams[nick]
  }

  function closeAllPeers() {
    for (const nick of Object.keys(peerConnections)) {
      removePeer(nick)
    }
    if (localStream.value) {
      localStream.value.getTracks().forEach(t => t.stop())
      localStream.value = null
    }
    inCall.value = false
    audioEnabled.value = true
    videoEnabled.value = true
    screenSharing.value = false
  }

  async function startCall() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      localStream.value = stream
      inCall.value = true

      for (const user of users) {
        if (user !== nickname.value) {
          const pc = createPeer(user)
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          sendSignal({
            type: 'offer',
            nickname: nickname.value,
            target: user,
            sdp: offer.sdp
          })
        }
      }
    } catch (e) {
      console.error('Failed to start call:', e)
      throw new Error('Не удалось получить доступ к камере/микрофону')
    }
  }

  function endCall() {
    sendSignal({ type: 'hangup', nickname: nickname.value })
    closeAllPeers()
  }

  async function handleSignal(msg) {
    switch (msg.type) {
      case 'offer':
        await handleOffer(msg)
        break
      case 'answer':
        await handleAnswer(msg)
        break
      case 'ice':
        await handleIce(msg)
        break
      case 'hangup':
        handleHangup(msg)
        break
    }
  }

  async function handleOffer(msg) {
    if (!inCall.value) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        localStream.value = stream
        inCall.value = true
      } catch (e) {
        console.error('Failed to get media for incoming call:', e)
        return
      }
    }

    const pc = createPeer(msg.nickname)
    await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: msg.sdp }))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    sendSignal({
      type: 'answer',
      nickname: nickname.value,
      target: msg.nickname,
      sdp: answer.sdp
    })
  }

  async function handleAnswer(msg) {
    const pc = peerConnections[msg.nickname]
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.sdp }))
    }
  }

  async function handleIce(msg) {
    const pc = peerConnections[msg.nickname]
    if (pc && msg.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate))
      } catch (e) {
        console.error('Failed to add ICE candidate:', e)
      }
    }
  }

  function handleHangup(msg) {
    removePeer(msg.nickname)
    if (Object.keys(peerConnections).length === 0 && inCall.value) {
      closeAllPeers()
    }
  }

  function toggleAudio() {
    if (localStream.value) {
      localStream.value.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
      audioEnabled.value = !audioEnabled.value
    }
  }

  function toggleVideo() {
    if (localStream.value) {
      localStream.value.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
      videoEnabled.value = !videoEnabled.value
    }
  }

  async function toggleScreenShare() {
    if (screenSharing.value) {
      // Stop screen sharing, revert to camera
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        const newVideoTrack = camStream.getVideoTracks()[0]
        const newAudioTrack = camStream.getAudioTracks()[0]

        // Stop old screen tracks
        localStream.value.getVideoTracks().forEach(t => t.stop())

        // Replace tracks in local stream
        const oldVideoTrack = localStream.value.getVideoTracks()[0]
        if (oldVideoTrack) localStream.value.removeTrack(oldVideoTrack)
        localStream.value.addTrack(newVideoTrack)

        // Replace in all peer connections
        for (const pc of Object.values(peerConnections)) {
          const senders = pc.getSenders()
          const videoSender = senders.find(s => s.track && s.track.kind === 'video')
          if (videoSender) await videoSender.replaceTrack(newVideoTrack)
        }

        // Stop extra audio track from camStream (we keep existing audio)
        newAudioTrack.stop()
      } catch (e) {
        console.error('Failed to revert to camera:', e)
      }
      screenSharing.value = false
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const screenTrack = screenStream.getVideoTracks()[0]

        // When user clicks browser's "Stop sharing" button
        screenTrack.onended = () => {
          toggleScreenShare() // revert to camera
        }

        // Stop current camera video track
        localStream.value.getVideoTracks().forEach(t => t.stop())

        // Replace in local stream
        const oldVideoTrack = localStream.value.getVideoTracks()[0]
        if (oldVideoTrack) localStream.value.removeTrack(oldVideoTrack)
        localStream.value.addTrack(screenTrack)

        // Replace in all peer connections
        for (const pc of Object.values(peerConnections)) {
          const senders = pc.getSenders()
          const videoSender = senders.find(s => s.track && s.track.kind === 'video')
          if (videoSender) await videoSender.replaceTrack(screenTrack)
        }

        screenSharing.value = true
      } catch (e) {
        console.error('Screen share cancelled or failed:', e)
      }
    }
  }

  return {
    inCall, audioEnabled, videoEnabled, screenSharing, localStream,
    remoteStreams, videoCount,
    startCall, endCall, handleSignal,
    toggleAudio, toggleVideo, toggleScreenShare, closeAllPeers
  }
}
