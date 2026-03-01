import mongoose from 'mongoose';
import MissionContext from './models/MissionContext';

mongoose.connect('mongodb://127.0.0.1:27017/ai-software-house').then(async () => {
    await MissionContext.create({
        projectId: 'MOCK-TEST-001',
        clientId: 'test-client',
        status: 'DEVELOPMENT',
        backlog: [
            {
                id: 'TSK-001',
                title: 'Design Database Schema',
                description: 'Create the initial schema for users and projects.',
                status: 'TODO',
                assignee: 'STRATEGIST',
                storyPoints: 5,
                subtasks: [{title: 'Create User Collection', done: false}, {title: 'Create Project Collection', done: false}]
            },
            {
                id: 'TSK-002',
                title: 'Implement Auth Endpoint',
                description: 'Write the login and register routes.',
                status: 'IN_PROGRESS',
                assignee: 'BUILDER',
                storyPoints: 8,
                subtasks: [{title: 'JWT generation', done: true}, {title: 'Password hashing', done: false}]
            }
        ]
    });
    console.log('Mock mission injected!');
    process.exit(0);
}).catch(console.error);
