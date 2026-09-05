const express = require('express');
const {
  getTasks,
  createTask,
  updateStatus,
  assignTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.patch('/:id/status', updateStatus);
router.patch('/:id/assign', assignTask);
router.delete('/:id', deleteTask);

module.exports = router;
