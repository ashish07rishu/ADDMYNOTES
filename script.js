/**
 * Notes App - Core JavaScript Logic
 * 
 * A fully functional notes application with the following features:
 * - Add new notes via textarea and button
 * - Display all notes in a responsive grid
 * - Delete individual notes with confirmation
 * - Persist data using localStorage
 * - Smooth animations and user feedback
 * 
 * @author Ashish Kumar
 * @version 1.0.0
 */
class NotesApp {
    /**
     * Initialize the Notes App
     * Sets up DOM references and loads existing notes
     */
    constructor() {
        // Array to store all notes
        this.notes = [];
        
        // DOM element references
        this.noteInput = document.getElementById('noteInput');
        this.addNoteBtn = document.getElementById('addNoteBtn');
        this.notesContainer = document.getElementById('notesContainer');
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Initialize the application
     * Loads existing notes, displays them, and sets up event listeners
     */
    init() {
        this.loadNotes();
        this.showNotes();
        this.bindEvents();
    }
    
    /**
     * Bind event listeners to DOM elements
     * Sets up click and keyboard event handlers
     */
    bindEvents() {
        // Add note on button click
        this.addNoteBtn.addEventListener('click', () => this.saveNote());
        
        // Add note on Ctrl+Enter keyboard shortcut
        this.noteInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.saveNote();
            }
        });
    }
    
    /**
     * Save a new note to the notes array and localStorage
     * Validates input, creates note object, and updates display
     */
    saveNote() {
        // Get and validate input text
        const noteText = this.noteInput.value.trim();
        
        // Reject empty notes
        if (noteText === '') {
            this.showMessage('Please enter a note before adding!', 'error');
            return;
        }
        
        // Create new note object with unique ID and timestamp
        const note = {
            id: this.generateId(),
            content: noteText,
            timestamp: new Date().toISOString(),
            dateCreated: this.formatDate(new Date())
        };
        
        // Add to beginning of array (newest first)
        this.notes.unshift(note);
        
        // Save to localStorage and update display
        this.saveToLocalStorage();
        this.showNotes();
        this.clearInput();
        this.showMessage('Note added successfully!', 'success');
    }
    
    /**
     * Delete a note by its unique ID
     * Shows confirmation dialog and removes note with animation
     * @param {string} noteId - The unique ID of the note to delete
     */
    deleteNote(noteId) {
        // Confirm deletion with user
        if (confirm('Are you sure you want to delete this note?')) {
            const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
            
            // Add removing animation before actual deletion
            if (noteElement) {
                noteElement.classList.add('removing');
                
                // Wait for animation to complete, then remove
                setTimeout(() => {
                    this.notes = this.notes.filter(note => note.id !== noteId);
                    this.saveToLocalStorage();
                    this.showNotes();
                    this.showMessage('Note deleted successfully!', 'success');
                }, 300);
            }
        }
    }
    
    // Display all notes
    showNotes() {
        this.notesContainer.innerHTML = '';
        
        if (this.notes.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.notes.forEach(note => {
            const noteElement = this.createNoteElement(note);
            this.notesContainer.appendChild(noteElement);
        });
    }
    
    // Create HTML element for a single note
    createNoteElement(note) {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note';
        noteDiv.setAttribute('data-note-id', note.id);
        
        noteDiv.innerHTML = `
            <div class="note-content">${this.escapeHtml(note.content)}</div>
            <div class="note-footer">
                <span class="note-date">${note.dateCreated}</span>
                <button class="delete-btn" onclick="notesApp.deleteNote('${note.id}')">
                    🗑️ Delete
                </button>
            </div>
        `;
        
        return noteDiv;
    }
    
    // Show empty state when no notes exist
    showEmptyState() {
        this.notesContainer.innerHTML = `
            <div class="empty-state">
                <p>No notes yet. Add your first note above!</p>
            </div>
        `;
    }
    
    // Load notes from localStorage
    loadNotes() {
        try {
            const storedNotes = localStorage.getItem('notesApp');
            if (storedNotes) {
                this.notes = JSON.parse(storedNotes);
            }
        } catch (error) {
            console.error('Error loading notes from localStorage:', error);
            this.notes = [];
        }
    }
    
    // Save notes to localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('notesApp', JSON.stringify(this.notes));
        } catch (error) {
            console.error('Error saving notes to localStorage:', error);
            this.showMessage('Error saving notes. Storage might be full.', 'error');
        }
    }
    
    // Clear the input textarea
    clearInput() {
        this.noteInput.value = '';
        this.noteInput.focus();
    }
    
    // Generate unique ID for notes
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Format date for display
    formatDate(date) {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Show temporary messages to user
    showMessage(message, type = 'info') {
        // Remove existing message if any
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                messageDiv.style.background = '#2ed573';
                break;
            case 'error':
                messageDiv.style.background = '#ff4757';
                break;
            default:
                messageDiv.style.background = '#5352ed';
        }
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, 3000);
    }
    
    // Get notes count (utility method)
    getNotesCount() {
        return this.notes.length;
    }
    
    // Search notes (bonus feature)
    searchNotes(query) {
        if (!query.trim()) {
            this.showNotes();
            return;
        }
        
        const filteredNotes = this.notes.filter(note => 
            note.content.toLowerCase().includes(query.toLowerCase())
        );
        
        this.displayFilteredNotes(filteredNotes);
    }
    
    // Display filtered notes
    displayFilteredNotes(filteredNotes) {
        this.notesContainer.innerHTML = '';
        
        if (filteredNotes.length === 0) {
            this.notesContainer.innerHTML = `
                <div class="empty-state">
                    <p>No notes found matching your search.</p>
                </div>
            `;
            return;
        }
        
        filteredNotes.forEach(note => {
            const noteElement = this.createNoteElement(note);
            this.notesContainer.appendChild(noteElement);
        });
    }
}

// Add CSS for message animations
const messageStyles = document.createElement('style');
messageStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(messageStyles);

// Initialize the app when DOM is loaded
let notesApp;

// Load notes automatically when page loads
window.onload = function() {
    notesApp = new NotesApp();
    console.log('Notes App initialized successfully!');
    console.log(`Loaded ${notesApp.getNotesCount()} existing notes`);
};

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotesApp;
}
