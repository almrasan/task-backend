const Task = require('../models/Task');

const populateOpts = [
  { path: 'creator', select: 'name email' },
  { path: 'assignedTo', select: 'name email' },
];

// GET /api/tasks
// Admin: sees every task. Normal user: sees tasks they created, tasks assigned to them,
// and unassigned tasks (so they can pick one up).
exports.getTasks = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? {}
        : {
            $or: [
              { creator: req.user._id },
              { assignedTo: req.user._id },
              { assignedTo: null },
            ],
          };
    const tasks = await Task.find(filter).populate(populateOpts).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const task = await Task.create({
      title,
      description,
      creator: req.user._id,
      status: 'todo',
      assignedTo: null,
    });
    const populated = await task.populate(populateOpts);
    res.status(201).json({ task: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
};

// PATCH /api/tasks/:id/status  — move a card between columns
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['todo', 'doing', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isOwnerOrAssignee =
      task.creator.equals(req.user._id) ||
      (task.assignedTo && task.assignedTo.equals(req.user._id));

    if (req.user.role !== 'admin' && !isOwnerOrAssignee) {
      return res.status(403).json({ message: 'Not allowed to move this task' });
    }

    task.status = status;
    await task.save();
    const populated = await task.populate(populateOpts);
    res.json({ task: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};

// PATCH /api/tasks/:id/assign
// Normal user: can only assign an UNASSIGNED task to THEMSELVES.
// Admin: can assign/reassign any task to any user (or unassign with userId: null).
exports.assignTask = async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'admin') {
      task.assignedTo = userId || null;
    } else {
      if (task.assignedTo) {
        return res.status(403).json({ message: 'Task is already assigned' });
      }
      if (userId && userId !== String(req.user._id)) {
        return res.status(403).json({ message: 'You can only assign tasks to yourself' });
      }
      task.assignedTo = req.user._id;
    }

    await task.save();
    const populated = await task.populate(populateOpts);
    res.json({ task: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to assign task', error: err.message });
  }
};

// PATCH /api/tasks/:id  — edit title/description (creator or admin)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' && !task.creator.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not allowed to edit this task' });
    }

    const { title, description } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    await task.save();
    const populated = await task.populate(populateOpts);
    res.json({ task: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
};

// DELETE /api/tasks/:id  (creator or admin)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' && !task.creator.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not allowed to delete this task' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
};
