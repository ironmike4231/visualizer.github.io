const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Endpoint for audio and frames upload
app.post('/generate-video', upload.single('audio'), (req, res) => {
  const audioFile = req.file.path;
  const framesDir = req.body.framesDir; // Assume frames are uploaded as an array of image files
  const outputVideo = `output/${Date.now()}_visualizer.mp4`;

  // FFmpeg command to create video
  const command = `
    ffmpeg -framerate 30 -i ${framesDir}/frame_%04d.png -i ${audioFile} \
    -c:v libx264 -c:a aac -strict experimental -shortest ${outputVideo}
  `;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating video: ${error.message}`);
      return res.status(500).send('Error generating video');
    }

    res.download(outputVideo, 'visualizer.mp4', () => {
      // Cleanup temporary files
      fs.unlinkSync(audioFile);
      fs.rmSync(framesDir, { recursive: true, force: true });
      fs.unlinkSync(outputVideo);
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
