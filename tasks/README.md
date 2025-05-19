# Beesides Task Management System

This task management system has been set up to help organize and track work on the Beesides web application. The system is based on a simple JSON structure with a Node.js script to manage tasks.

## Structure

- `tasks/tasks.json`: The main data file containing all tasks and their metadata
- `tasks/*.md`: Individual markdown files for each task with details
- `scripts/task-manager.js`: A Node.js script to manage tasks

## Using the Task Manager

You can run the task manager script using:

```bash
node scripts/task-manager.js [command]
```

### Available Commands

- `list [status]`: List all tasks or filter by status (pending, in-progress, done)
- `add`: Add a new task (interactive)
- `status <id> <status>`: Update task status
- `next`: Find the next task to work on
- `generate`: Generate individual task files
- `help`: Show help message
- `exit`: Exit the program

### Examples

List all tasks:
```bash
node scripts/task-manager.js list
```

List only pending tasks:
```bash
node scripts/task-manager.js list pending
```

Update a task status:
```bash
node scripts/task-manager.js status 1 in-progress
```

Find the next task to work on:
```bash
node scripts/task-manager.js next
```

## Task Statuses

- `pending`: Task not yet started
- `in-progress`: Task currently being worked on
- `review`: Task completed but needs review
- `done`: Task completed and verified

## Task Priorities

- `high`: Critical tasks that should be completed first
- `medium`: Important tasks but not critical
- `low`: Nice-to-have tasks

## Task Dependencies

Tasks can depend on other tasks, which means they should only be started after their dependencies are completed. The task manager will help you identify which tasks are ready to be worked on.
