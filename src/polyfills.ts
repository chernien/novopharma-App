import 'zone.js';  // ✅ indispensable pour Angular

// --- Configuration Buffer (pour tesseract.js) ---
import { Buffer } from 'buffer';

(window as any).global = window;
(window as any).Buffer = (window as any).Buffer || Buffer;
