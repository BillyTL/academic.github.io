const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   EDUCORE Backend corriendo en :${PORT}      ║
  ║   http://localhost:${PORT}/api/health       ║
  ╚═══════════════════════════════════════════╝
  `);
});
