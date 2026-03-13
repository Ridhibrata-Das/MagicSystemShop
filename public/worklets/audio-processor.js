class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.sampleRate = options.processorOptions.sampleRate || 16000;
    this.bufferSize = options.processorOptions.bufferSize || 4096;
    this.buffer = new Int16Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];
      
      for (let i = 0; i < channelData.length; i++) {
        // Convert float32 to int16
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        this.buffer[this.bufferIndex++] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;

        if (this.bufferIndex >= this.bufferSize) {
          // Calculate audio level
          let sum = 0;
          for (let j = 0; j < this.bufferSize; j++) {
            sum += Math.abs(this.buffer[j] / 32768);
          }
          const level = (sum / this.bufferSize) * 100;

          // Send buffer to main thread
          this.port.postMessage({
            pcmData: this.buffer.buffer.slice(0),
            level: level
          });
          
          this.bufferIndex = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
