import * as fs from 'fs';
import * as path from 'path';
import { ChatMessage } from './llmService';

export interface AnalysisStep {
    id: number;
    name: string;
    prompt: string;
    result: string;
    status: 'pending' | 'completed' | 'self-checking' | 'error';
    selfChecked: boolean;
}

export interface Session {
    id: string;
    name: string;
    requirements: string;
    messages: ChatMessage[];
    steps: AnalysisStep[];
    currentStep: number;
    createdAt: Date;
    updatedAt: Date;
    sessionDir?: string;
}

export class SessionManager {
    private sessions: Map<string, Session> = new Map();
    private storagePath: string;

    constructor(storageDir?: string) {
        this.storagePath = storageDir || this.getDefaultStoragePath();
        this.loadSessions();
    }

    private getDefaultStoragePath(): string {
        const workspaceDir = process.env.SE_AGENT_WORKSPACE || process.cwd();
        return path.join(workspaceDir, '.se-agent', 'sessions');
    }

    private loadSessions(): void {
        try {
            if (fs.existsSync(this.storagePath)) {
                const files = fs.readdirSync(this.storagePath);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        const content = fs.readFileSync(path.join(this.storagePath, file), 'utf-8');
                        const session = JSON.parse(content);
                        session.createdAt = new Date(session.createdAt);
                        session.updatedAt = new Date(session.updatedAt);
                        this.sessions.set(session.id, session);
                    }
                }
            }
        } catch (error) {
            console.error('加载会话失败:', error);
        }
    }

    private saveSessionToFile(session: Session): void {
        try {
            if (!fs.existsSync(this.storagePath)) {
                fs.mkdirSync(this.storagePath, { recursive: true });
            }
            const filePath = path.join(this.storagePath, `${session.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
        } catch (error) {
            console.error('保存会话失败:', error);
        }
    }

    createSession(name: string, requirements: string): Session {
        const id = `${name}-${Date.now()}`;
        const sessionDir = path.join(this.storagePath, id);

        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }

        const steps: AnalysisStep[] = [
            { id: 1, name: '用例建模', prompt: '', result: '', status: 'pending', selfChecked: false },
            { id: 2, name: '绘制活动图', prompt: '', result: '', status: 'pending', selfChecked: false },
            { id: 3, name: '识别候选类', prompt: '', result: '', status: 'pending', selfChecked: false },
            { id: 4, name: '分析类与关系', prompt: '', result: '', status: 'pending', selfChecked: false },
            { id: 5, name: '绘制状态机图', prompt: '', result: '', status: 'pending', selfChecked: false },
            { id: 6, name: '设计细化', prompt: '', result: '', status: 'pending', selfChecked: false },
        ];

        const session: Session = {
            id,
            name,
            requirements,
            messages: [],
            steps,
            currentStep: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            sessionDir,
        };

        this.sessions.set(id, session);
        this.saveSessionToFile(session);
        return session;
    }

    getSession(id: string): Session | undefined {
        return this.sessions.get(id);
    }

    getAllSessions(): Session[] {
        return Array.from(this.sessions.values());
    }

    updateSession(session: Session): void {
        session.updatedAt = new Date();
        this.sessions.set(session.id, session);
        this.saveSessionToFile(session);
    }

    deleteSession(id: string): void {
        this.sessions.delete(id);
        try {
            const filePath = path.join(this.storagePath, `${id}.json`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('删除会话失败:', error);
        }
    }

    addMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.messages.push({ role, content });
            this.updateSession(session);
        }
    }

    updateStep(sessionId: string, stepId: number, result: string, status: AnalysisStep['status']): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            const step = session.steps.find(s => s.id === stepId);
            if (step) {
                step.result = result;
                step.status = status;
                session.currentStep = stepId;
            }
            this.updateSession(session);
        }
    }

    setSelfChecked(sessionId: string, stepId: number, checked: boolean): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            const step = session.steps.find(s => s.id === stepId);
            if (step) {
                step.selfChecked = checked;
            }
            this.updateSession(session);
        }
    }
}

export let sessionManager: SessionManager;

try {
    const vscode = require('vscode');
    const workspaceFolders = vscode.workspace.workspaceFolders;
    let storagePath = path.join(__dirname, '..', '..', 'sessions');
    if (workspaceFolders) {
        storagePath = path.join(workspaceFolders[0].uri.fsPath, '.se-agent', 'sessions');
    }
    sessionManager = new SessionManager(storagePath);
} catch {
    sessionManager = new SessionManager();
}
