require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const Task = require("./models/Task");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Configurar motor de plantillas EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Conexión a MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error de conexión:", err));

// ========== RUTAS DE LA API ==========

// Obtener todas las tareas
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear una nueva tarea
app.post("/api/tasks", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ error: "El nombre de la tarea es obligatorio" });
    }
    const newTask = new Task({ name: name.trim() });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar tarea (completada / no completada)
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { completed } = req.body;
    if (typeof completed !== "boolean") {
      return res
        .status(400)
        .json({ error: "El campo completed debe ser booleano" });
    }
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true, runValidators: true },
    );
    if (!updatedTask) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar tarea
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json({ message: "Tarea eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Servir la vista principal (index.ejs)
app.get("/", (req, res) => {
  res.render("index");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
