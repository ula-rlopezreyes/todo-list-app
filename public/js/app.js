$(document).ready(function () {
  const taskList = $("#taskList");

  // ========== Cargar tareas desde el servidor ==========
  function loadTasks() {
    $.ajax({
      url: "/api/tasks",
      method: "GET",
      dataType: "json",
      success: function (tasks) {
        renderTasks(tasks);
      },
      error: function (err) {
        console.error("Error al cargar tareas:", err);
        taskList.html(
          '<li class="placeholder">❌ Error al cargar las tareas</li>',
        );
      },
    });
  }

  // ========== Renderizar lista de tareas ==========
  function renderTasks(tasks) {
    if (!tasks || tasks.length === 0) {
      taskList.html(
        '<li class="placeholder">✨ No hay tareas pendientes. ¡Agrega una!</li>',
      );
      return;
    }

    let html = "";
    tasks.forEach((task) => {
      const checkedAttr = task.completed ? "checked" : "";
      const completedClass = task.completed ? "completed" : "";
      html += `
        <li data-id="${task._id}" class="${completedClass}">
          <div class="task-info">
            <input type="checkbox" class="task-check" ${checkedAttr}>
            <span class="task-text">${escapeHtml(task.name)}</span>
          </div>
          <button class="delete-btn" aria-label="Eliminar">🗑️</button>
        </li>
      `;
    });
    taskList.html(html);
  }

  // Helper para escapar HTML (seguridad)
  function escapeHtml(str) {
    return str
      .replace(/[&<>]/g, function (m) {
        if (m === "&") return "&amp;";
        if (m === "<") return "&lt;";
        if (m === ">") return "&gt;";
        return m;
      })
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function (c) {
        return c;
      });
  }

  // ========== Agregar nueva tarea ==========
  $("#addBtn").on("click", function () {
    const taskName = $("#taskInput").val().trim();
    if (taskName === "") {
      alert("Por favor escribe una tarea válida");
      return;
    }

    $.ajax({
      url: "/api/tasks",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ name: taskName }),
      success: function (newTask) {
        $("#taskInput").val(""); // limpiar input
        loadTasks(); // recargar lista
      },
      error: function (xhr) {
        console.error(xhr);
        alert(
          "Error al crear la tarea: " +
            (xhr.responseJSON?.error || "Intenta de nuevo"),
        );
      },
    });
  });

  // Permitir agregar tarea con Enter
  $("#taskInput").on("keypress", function (e) {
    if (e.which === 13) {
      $("#addBtn").click();
    }
  });

  // ========== Marcar tarea como completada (toggle) ==========
  taskList.on("change", ".task-check", function () {
    const $li = $(this).closest("li");
    const taskId = $li.data("id");
    const isChecked = $(this).prop("checked");

    $.ajax({
      url: `/api/tasks/${taskId}`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify({ completed: isChecked }),
      success: function (updatedTask) {
        // Actualizar la clase visual sin recargar toda la lista (mejor UX)
        if (updatedTask.completed) {
          $li.addClass("completed");
        } else {
          $li.removeClass("completed");
        }
      },
      error: function (err) {
        console.error(err);
        alert("No se pudo actualizar el estado de la tarea");
        // Revertir checkbox visual
        $(this).prop("checked", !isChecked);
      },
    });
  });

  // ========== Eliminar tarea ==========
  taskList.on("click", ".delete-btn", function (e) {
    e.stopPropagation();
    const $li = $(this).closest("li");
    const taskId = $li.data("id");
    const taskName = $li.find(".task-text").text();

    if (confirm(`¿Eliminar la tarea "${taskName}"?`)) {
      $.ajax({
        url: `/api/tasks/${taskId}`,
        method: "DELETE",
        success: function () {
          // Animación suave de salida
          $li.fadeOut(300, function () {
            $(this).remove();
            // Si después de eliminar no quedan elementos, mostrar placeholder
            if (taskList.children("li").length === 0) {
              taskList.html(
                '<li class="placeholder">✨ No hay tareas pendientes. ¡Agrega una!</li>',
              );
            }
          });
        },
        error: function (err) {
          console.error(err);
          alert("Error al eliminar la tarea");
        },
      });
    }
  });

  // Cargar tareas iniciales al cargar la página
  loadTasks();
});
