import { Injectable } from '@angular/core';

export interface ChunkItem {
  id: string;
  source: string;
  data: any[];
  sent: boolean;
}

export interface QueueSession {
  sessionId: string;
  username: string;
  selectedDate: string;
  totalItems: number;
  chunks: ChunkItem[];
  createdAt: string;
}

const QUEUE_KEY = 'novo_commande_queue';

@Injectable({ providedIn: 'root' })
export class CommandeQueueService {

  /**
   * Crée et persiste une nouvelle session d'envoi avant tout envoi réseau.
   */
  createSession(
    chunks: ChunkItem[],
    username: string,
    selectedDate: string,
    totalItems: number
  ): QueueSession {
    const session: QueueSession = {
      sessionId: `${Date.now()}`,
      username,
      selectedDate,
      totalItems,
      chunks,
      createdAt: new Date().toISOString(),
    };
    this.persist(session);
    return session;
  }

  /** Retourne la session en cours (ou null). */
  getSession(): QueueSession | null {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as QueueSession;
    } catch {
      return null;
    }
  }

  /** True s'il existe des chunks non envoyés. */
  hasIncompleteSession(): boolean {
    const session = this.getSession();
    return !!session && session.chunks.some(c => !c.sent);
  }

  /** Marque un chunk comme envoyé et sauvegarde immédiatement. */
  markChunkSent(sessionId: string, chunkId: string): void {
    const session = this.getSession();
    if (!session || session.sessionId !== sessionId) return;
    const chunk = session.chunks.find(c => c.id === chunkId);
    if (chunk) {
      chunk.sent = true;
      this.persist(session);
    }
  }

  /** Chunks qui n'ont pas encore été envoyés. */
  getPendingChunks(session: QueueSession): ChunkItem[] {
    return session.chunks.filter(c => !c.sent);
  }

  /** Nombre d'articles déjà envoyés dans la session. */
  getSentCount(session: QueueSession): number {
    return session.chunks
      .filter(c => c.sent)
      .reduce((acc, c) => acc + c.data.length, 0);
  }

  /** Supprime la session (appelé en cas de succès complet). */
  clearSession(): void {
    localStorage.removeItem(QUEUE_KEY);
  }

  private persist(session: QueueSession): void {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('[CommandeQueue] Impossible de persister la session :', e);
    }
  }
}
