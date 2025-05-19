#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execPromise = promisify(exec);

// Path to the tasks file
const TASKS_FILE = path.join(__dirname, '../tasks/tasks.json');
const TESTS_DIR = path.join(__dirname, '../tests/tasks');

/**
 * Run tests for a specific task
 * @param {string} taskId - The ID of the task to run tests for
 * @param {boolean} [headless=true] - Whether to run tests in headless mode
 * @returns {Promise<void>}
 */
async function runTaskTests(taskId, headless = true) {
  try {
    // Read the tasks file to get task information
    const tasksData = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    const task = tasksData.tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error(`Task with ID ${taskId} not found.`);
      process.exit(1);
    }
    
    console.log(`\n=== Running tests for Task #${taskId}: ${task.title} ===\n`);
    
    // Check if tests exist for this task
    const taskTestDir = path.join(TESTS_DIR, taskId);
    
    if (!fs.existsSync(taskTestDir)) {
      console.warn(`No tests found for Task #${taskId}. Creating test directory...`);
      fs.mkdirSync(taskTestDir, { recursive: true });
      
      // Create a placeholder test file
      const placeholderTestPath = path.join(taskTestDir, 'placeholder.spec.ts');
      const placeholderTest = `
import { test, expect } from '@playwright/test';

test('Task #${taskId} placeholder test', async ({ page }) => {
  // This is a placeholder test. Replace with actual tests for Task #${taskId}.
  test.skip(true, 'This is a placeholder test. Replace with actual tests for this task.');
  
  // Example test:
  // await page.goto('/');
  // await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
      `.trim();
      
      fs.writeFileSync(placeholderTestPath, placeholderTest);
      console.log(`Created placeholder test file: ${placeholderTestPath}`);
      console.log('Please add actual tests before running again.');
      process.exit(0);
    }
    
    // Run the tests for this task
    const headlessFlag = headless ? '--headed=false' : '--headed=true';
    const testCommand = `npx playwright test ${taskTestDir} ${headlessFlag}`;
    
    console.log(`Running command: ${testCommand}\n`);
    
    const { stdout, stderr } = await execPromise(testCommand);
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log(`\n=== Tests completed for Task #${taskId} ===\n`);
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

/**
 * List all available task tests
 */
function listTaskTests() {
  try {
    if (!fs.existsSync(TESTS_DIR)) {
      console.log('No task tests found.');
      return;
    }
    
    const taskDirs = fs.readdirSync(TESTS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (taskDirs.length === 0) {
      console.log('No task tests found.');
      return;
    }
    
    console.log('\n=== Available Task Tests ===\n');
    
    // Read the tasks file to get task titles
    const tasksData = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    
    taskDirs.forEach(taskId => {
      const task = tasksData.tasks.find(t => t.id === taskId);
      const taskTitle = task ? task.title : 'Unknown Task';
      
      // Count the number of test files
      const testFiles = fs.readdirSync(path.join(TESTS_DIR, taskId))
        .filter(file => file.endsWith('.spec.ts') || file.endsWith('.test.ts'));
      
      console.log(`Task #${taskId}: ${taskTitle} (${testFiles.length} test files)`);
    });
    
    console.log('');
  } catch (error) {
    console.error('Error listing task tests:', error);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  
  switch (command) {
    case 'run':
      const taskId = args[1];
      const headless = args[2] !== 'ui';
      
      if (!taskId) {
        console.error('Please specify a task ID.');
        console.log('Usage: node task-test-runner.js run <taskId> [ui]');
        process.exit(1);
      }
      
      await runTaskTests(taskId, headless);
      break;
      
    case 'list':
      listTaskTests();
      break;
      
    default:
      console.log('Task Test Runner');
      console.log('----------------');
      console.log('Commands:');
      console.log('  list                  List all available task tests');
      console.log('  run <taskId> [ui]     Run tests for a specific task');
      console.log('                        Add "ui" to run in headed mode');
      break;
  }
}

main().catch(console.error);
