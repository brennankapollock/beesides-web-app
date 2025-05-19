#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TASKS_FILE = path.join(__dirname, '../tasks/tasks.json');
const TASK_TEMPLATE_DIR = path.join(__dirname, '../tasks');

// Ensure tasks directory exists
if (!fs.existsSync(TASK_TEMPLATE_DIR)) {
  fs.mkdirSync(TASK_TEMPLATE_DIR, { recursive: true });
}

// Read tasks data
function readTasks() {
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks file:', error.message);
    return { tasks: [], version: '1.0.0', projectName: 'beesides-web-app', created: new Date().toISOString(), updated: new Date().toISOString() };
  }
}

// Write tasks data
function writeTasks(tasksData) {
  tasksData.updated = new Date().toISOString();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasksData, null, 2), 'utf8');
    console.log('Tasks file updated successfully.');
  } catch (error) {
    console.error('Error writing tasks file:', error.message);
  }
}

// Generate individual task files
function generateTaskFiles(tasksData) {
  tasksData.tasks.forEach(task => {
    const taskFileName = `${task.id}-${task.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    const taskFilePath = path.join(TASK_TEMPLATE_DIR, taskFileName);
    
    let taskContent = `# ${task.title}\n\n`;
    taskContent += `**ID:** ${task.id}\n`;
    taskContent += `**Status:** ${task.status}\n`;
    taskContent += `**Priority:** ${task.priority}\n`;
    taskContent += `**Dependencies:** ${task.dependencies.join(', ') || 'None'}\n\n`;
    taskContent += `## Description\n\n${task.description}\n\n`;
    taskContent += `## Details\n\n${task.details || 'No details provided.'}\n\n`;
    taskContent += `## Notes\n\n`;
    
    fs.writeFileSync(taskFilePath, taskContent, 'utf8');
  });
  
  console.log(`Generated ${tasksData.tasks.length} task files in ${TASK_TEMPLATE_DIR}`);
}

// List all tasks
function listTasks(tasksData, filter = null) {
  console.log('\n=== TASKS ===\n');
  
  const filteredTasks = filter 
    ? tasksData.tasks.filter(task => task.status === filter)
    : tasksData.tasks;
  
  if (filteredTasks.length === 0) {
    console.log('No tasks found.');
    return;
  }
  
  filteredTasks.forEach(task => {
    console.log(`[${task.id}] ${task.status.toUpperCase()} - ${task.title} (Priority: ${task.priority})`);
    console.log(`    ${task.description}`);
    if (task.dependencies.length > 0) {
      console.log(`    Dependencies: ${task.dependencies.join(', ')}`);
    }
    console.log('');
  });
}

// Add a new task
function addTask(tasksData, taskData) {
  const newId = String(Math.max(0, ...tasksData.tasks.map(t => parseInt(t.id))) + 1);
  const timestamp = new Date().toISOString();
  
  const newTask = {
    id: newId,
    title: taskData.title,
    description: taskData.description,
    status: taskData.status || 'pending',
    priority: taskData.priority || 'medium',
    dependencies: taskData.dependencies || [],
    created: timestamp,
    updated: timestamp,
    details: taskData.details || ''
  };
  
  tasksData.tasks.push(newTask);
  writeTasks(tasksData);
  generateTaskFiles(tasksData);
  
  console.log(`Added new task: [${newId}] ${newTask.title}`);
  return newId;
}

// Update task status
function updateTaskStatus(tasksData, taskId, newStatus) {
  const task = tasksData.tasks.find(t => t.id === taskId);
  if (!task) {
    console.error(`Task with ID ${taskId} not found.`);
    return false;
  }
  
  task.status = newStatus;
  task.updated = new Date().toISOString();
  writeTasks(tasksData);
  generateTaskFiles(tasksData);
  
  console.log(`Updated task [${taskId}] status to: ${newStatus}`);
  return true;
}

// Find next task to work on
function findNextTask(tasksData) {
  // Get all pending tasks
  const pendingTasks = tasksData.tasks.filter(task => task.status === 'pending');
  
  if (pendingTasks.length === 0) {
    console.log('No pending tasks found.');
    return null;
  }
  
  // Find tasks with no unfinished dependencies
  const availableTasks = pendingTasks.filter(task => {
    if (task.dependencies.length === 0) return true;
    
    // Check if all dependencies are completed
    return task.dependencies.every(depId => {
      const depTask = tasksData.tasks.find(t => t.id === depId);
      return depTask && depTask.status === 'done';
    });
  });
  
  if (availableTasks.length === 0) {
    console.log('No available tasks found. All pending tasks have unfinished dependencies.');
    return null;
  }
  
  // Sort by priority (high > medium > low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  availableTasks.sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  const nextTask = availableTasks[0];
  console.log('\n=== NEXT TASK ===\n');
  console.log(`[${nextTask.id}] ${nextTask.title} (Priority: ${nextTask.priority})`);
  console.log(`Description: ${nextTask.description}`);
  console.log(`Details: ${nextTask.details || 'No details provided.'}`);
  
  return nextTask;
}

// Command line interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showHelp() {
  console.log('\nTask Manager Commands:');
  console.log('  list [status]        - List all tasks or filter by status (pending, in-progress, done)');
  console.log('  add                  - Add a new task (interactive)');
  console.log('  status <id> <status> - Update task status');
  console.log('  next                 - Find the next task to work on');
  console.log('  generate             - Generate individual task files');
  console.log('  test <id> [ui]       - Run tests for a specific task (add "ui" for headed mode)');
  console.log('  verify <id>          - Run tests and generate a report for a completed task');
  console.log('  help                 - Show this help message');
  console.log('  exit                 - Exit the program\n');
}

function promptForTaskData(callback) {
  rl.question('Task title: ', (title) => {
    rl.question('Task description: ', (description) => {
      rl.question('Task details: ', (details) => {
        rl.question('Priority (high/medium/low) [medium]: ', (priority) => {
          rl.question('Dependencies (comma-separated IDs): ', (dependencies) => {
            const taskData = {
              title,
              description,
              details,
              priority: priority || 'medium',
              dependencies: dependencies ? dependencies.split(',').map(d => d.trim()) : []
            };
            callback(taskData);
          });
        });
      });
    });
  });
}

function processCommand(cmd) {
  const args = cmd.trim().split(' ');
  const command = args[0].toLowerCase();
  const tasksData = readTasks();
  
  switch (command) {
    case 'list':
      listTasks(tasksData, args[1]);
      promptForCommand();
      break;
      
    case 'add':
      promptForTaskData((taskData) => {
        addTask(tasksData, taskData);
        promptForCommand();
      });
      break;
      
    case 'status':
      if (args.length < 3) {
        console.log('Usage: status <id> <status>');
      } else {
        updateTaskStatus(tasksData, args[1], args[2]);
      }
      promptForCommand();
      break;
      
    case 'next':
      findNextTask(tasksData);
      promptForCommand();
      break;
      
    case 'generate':
      generateTaskFiles(tasksData);
      promptForCommand();
      break;
      
    case 'test':
      if (args.length < 2) {
        console.log('Usage: test <id> [ui]');
        promptForCommand();
        break;
      }
      
      const taskId = args[1];
      const uiMode = args[2] === 'ui' ? 'ui' : '';
      
      console.log(`Running tests for task ${taskId}${uiMode ? ' in UI mode' : ''}...`);
      
      // Close the readline interface temporarily
      rl.pause();
      
      // Use the child_process module to run the test runner
      exec(`node scripts/task-test-runner.js run ${taskId} ${uiMode}`, (error, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        
        if (error) {
          console.error(`Test execution error: ${error.message}`);
        }
        
        // Resume the readline interface
        rl.resume();
        promptForCommand();
      });
      break;
      
    case 'verify':
      if (args.length < 2) {
        console.log('Usage: verify <id>');
        promptForCommand();
        break;
      }
      
      const verifyTaskId = args[1];
      
      console.log(`Running verification tests for task ${verifyTaskId} and generating report...`);
      
      // Close the readline interface temporarily
      rl.pause();
      
      // Use the child_process module to run the test script
      exec(`./scripts/run-task-tests.sh ${verifyTaskId}`, (error, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        
        if (error) {
          console.error(`Verification error: ${error.message}`);
        }
        
        // Resume the readline interface
        rl.resume();
        promptForCommand();
      });
      break;
      
    case 'help':
      showHelp();
      promptForCommand();
      break;
      
    case 'exit':
      rl.close();
      break;
      
    default:
      console.log('Unknown command. Type "help" for available commands.');
      promptForCommand();
      break;
  }
}

function promptForCommand() {
  rl.question('\nEnter command (or "help"): ', (cmd) => {
    processCommand(cmd);
  });
}

// Main execution
console.log('=== Beesides Task Manager ===');
showHelp();

// Check if tasks file exists, if not create it
if (!fs.existsSync(TASKS_FILE)) {
  const initialData = { 
    tasks: [], 
    version: '1.0.0', 
    projectName: 'beesides-web-app', 
    created: new Date().toISOString(), 
    updated: new Date().toISOString() 
  };
  writeTasks(initialData);
}

// Generate task files from existing tasks
const tasksData = readTasks();
generateTaskFiles(tasksData);

// If command line arguments are provided
if (process.argv.length > 2) {
  const cmd = process.argv.slice(2).join(' ');
  processCommand(cmd);
} else {
  promptForCommand();
}
