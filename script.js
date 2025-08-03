// Daily Quotes
const DAILY_QUOTES = [
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { quote: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
    { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { quote: "Your limitation—it's only your imagination.", author: "Unknown" },
    { quote: "Push yourself, because no one else is going to do it for you.", author: "Unknown" }
];

// Global state
let currentRole = 'student';

// Role selection
function selectRole(role) {
    currentRole = role;
    
    // Update button states
    document.getElementById('studentRoleBtn').classList.toggle('active', role === 'student');
    document.getElementById('adminRoleBtn').classList.toggle('active', role === 'admin');
    
    // Update button text
    document.getElementById('loginRoleText').textContent = role === 'admin' ? 'Admin' : 'Student';
    document.getElementById('signupRoleText').textContent = role === 'admin' ? 'Admin' : 'Student';
}

// Notification Manager
class NotificationManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.requestPermission();
        this.bindEvents();
    }

    bindEvents() {
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }
    }

    loadSettings() {
        try {
            const currentUser = window.authManager?.getCurrentUser();
            if (!currentUser) return this.getDefaultSettings();
            
            const stored = localStorage.getItem(`notifications_${currentUser.id}`);
            return stored ? JSON.parse(stored) : this.getDefaultSettings();
        } catch (error) {
            console.error('Failed to load notification settings:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            enableNotifications: false,
            enableReminders: true,
            enableDailyQuotes: true,
            reminderSound: 'default'
        };
    }

    saveSettings() {
        try {
            const currentUser = window.authManager?.getCurrentUser();
            if (!currentUser) return;
            
            localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save notification settings:', error);
        }
    }

    async requestPermission() {
        if ('Notification' in window && this.settings.enableNotifications) {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                this.settings.enableNotifications = false;
                this.saveSettings();
            }
        }
    }

    showNotification(title, body, type = 'info', duration = 5000) {
        // In-app notification
        this.showInAppNotification(title, body, type, duration);

        // Browser notification
        if (this.settings.enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                tag: 'educheck360'
            });
        }
    }

    showInAppNotification(title, body, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">${title}</div>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-body">${body}</div>
        `;

        container.appendChild(notification);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Auto remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
    }

    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOutNotification 0.3s ease forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    showSettingsModal() {
        // Load current settings into modal
        document.getElementById('enableNotifications').checked = this.settings.enableNotifications;
        document.getElementById('enableReminders').checked = this.settings.enableReminders;
        document.getElementById('enableDailyQuotes').checked = this.settings.enableDailyQuotes;
        document.getElementById('reminderSound').value = this.settings.reminderSound;
        
        document.getElementById('notificationModal').classList.add('active');
    }

    async saveSettingsFromModal() {
        this.settings.enableNotifications = document.getElementById('enableNotifications').checked;
        this.settings.enableReminders = document.getElementById('enableReminders').checked;
        this.settings.enableDailyQuotes = document.getElementById('enableDailyQuotes').checked;
        this.settings.reminderSound = document.getElementById('reminderSound').value;

        // Request permission if notifications are enabled
        if (this.settings.enableNotifications) {
            await this.requestPermission();
        }

        this.saveSettings();
        this.closeSettingsModal();
        this.showNotification('Settings Saved', 'Your notification preferences have been updated.', 'success');

        // Update daily quote visibility
        this.updateQuoteVisibility();
    }

    closeSettingsModal() {
        document.getElementById('notificationModal').classList.remove('active');
    }

    updateQuoteVisibility() {
        const quoteSection = document.querySelector('.quote-section');
        if (quoteSection) {
            quoteSection.style.display = this.settings.enableDailyQuotes ? 'block' : 'none';
        }
    }
}

// Daily Quote Manager
class QuoteManager {
    constructor() {
        this.init();
    }

    init() {
        this.displayDailyQuote();
    }

    displayDailyQuote() {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const quoteIndex = dayOfYear % DAILY_QUOTES.length;
        const todaysQuote = DAILY_QUOTES[quoteIndex];

        const quoteElement = document.getElementById('dailyQuote');
        const authorElement = document.getElementById('quoteAuthor');
        
        if (quoteElement && authorElement) {
            quoteElement.textContent = `"${todaysQuote.quote}"`;
            authorElement.textContent = `— ${todaysQuote.author}`;
        }
    }
}

// Admin Manager
class AdminManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadAdminData();
    }

    bindEvents() {
        // Create user form
        const createUserForm = document.getElementById('createUserForm');
        if (createUserForm) {
            createUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateUser();
            });
        }

        // Admin action buttons
        const manageUsersBtn = document.getElementById('manageUsersBtn');
        if (manageUsersBtn) {
            manageUsersBtn.addEventListener('click', () => {
                this.switchAdminTab('users');
            });
        }

        const systemReportsBtn = document.getElementById('systemReportsBtn');
        if (systemReportsBtn) {
            systemReportsBtn.addEventListener('click', () => {
                this.switchAdminTab('reports');
            });
        }

        const analyticsBtn = document.getElementById('analyticsBtn');
        if (analyticsBtn) {
            analyticsBtn.addEventListener('click', () => {
                this.switchAdminTab('analytics');
            });
        }
    }

    async loadAdminData() {
        await this.updateAdminStats();
        await this.loadUsersTable();
        await this.loadAnalytics();
        this.loadReports();
    }

    async updateAdminStats() {
        try {
            const users = await this.getAllUsers();
            const allChecklists = await this.getAllChecklists();
            const allTasks = allChecklists.flatMap(c => c.tasks || []);
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const stats = {
                totalUsers: users.length,
                activeUsers: users.filter(u => u.isActive !== false).length,
                totalChecklists: allChecklists.length,
                totalTasks: allTasks.length,
                systemCompletionRate: allTasks.length > 0 ? Math.round((allTasks.filter(t => t.completed).length / allTasks.length) * 100) : 0,
                newUsersThisWeek: users.filter(u => new Date(u.createdAt) >= oneWeekAgo).length
            };

            // Update admin stats display
            this.updateElement('totalUsers', stats.totalUsers);
            this.updateElement('activeUsers', stats.activeUsers);
            this.updateElement('totalChecklistsAdmin', stats.totalChecklists);
            this.updateElement('totalTasksAdmin', stats.totalTasks);
            this.updateElement('systemCompletionRate', `${stats.systemCompletionRate}%`);
            this.updateElement('newUsersThisWeek', stats.newUsersThisWeek);
        } catch (error) {
            console.error('Failed to update admin stats:', error);
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    async getAllUsers() {
        try {
            // Check if Firebase is properly initialized
            if (!window.db) {
                console.error('Firebase not initialized');
                return [];
            }
            
            const usersSnapshot = await window.db.collection('users').get();
            const users = [];
            usersSnapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
            return users;
        } catch (error) {
            console.error('Failed to load users from Firestore:', error);
            return [];
        }
    }

    async getAllChecklists() {
        try {
            // Check if Firebase is properly initialized
            if (!window.db) {
                console.error('Firebase not initialized');
                return [];
            }
            
            const checklistsSnapshot = await window.db.collection('checklists').get();
            const checklists = [];
            checklistsSnapshot.forEach(doc => {
                checklists.push({ id: doc.id, ...doc.data() });
            });
            return checklists;
        } catch (error) {
            console.error('Failed to load checklists from Firestore:', error);
            return [];
        }
    }

    formatDate(dateValue) {
        try {
            if (!dateValue) return 'N/A';
            
            let date;
            
            // Handle Firestore timestamp objects
            if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
                date = dateValue.toDate();
            }
            // Handle Firestore timestamp with seconds property
            else if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
                date = new Date(dateValue.seconds * 1000);
            }
            // Handle regular date strings or Date objects
            else {
                date = new Date(dateValue);
            }
            
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            // Format as readable date (e.g., "12/25/2023" or "Dec 25, 2023")
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid Date';
        }
    }

    async loadUsersTable() {
        try {
            const users = await this.getAllUsers();
            const tbody = document.getElementById('usersTableBody');
            if (!tbody) return;

            const userRows = await Promise.all(users.map(async (user) => {
                const userChecklists = await this.getUserChecklists(user.id);
                const userTasks = userChecklists.flatMap(c => c.tasks || []);
                const completedTasks = userTasks.filter(t => t.completed).length;
                const completionRate = userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0;

                return `
                    <tr>
                        <td>
                            <div class="user-info">
                                <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div class="user-name">${this.escapeHtml(user.name)}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="role-badge role-${user.role || 'student'}">
                                ${user.role === 'admin' ? '👨‍💼' : '👨‍🎓'} ${this.capitalize(user.role || 'student')}
                            </span>
                        </td>
                        <td>${this.escapeHtml(user.email)}</td>
                        <td>${this.formatDate(user.createdAt)}</td>
                        <td>${this.formatDate(user.lastLogin) || 'Never'}</td>
                        <td>${userChecklists.length}</td>
                        <td>${completedTasks} (${completionRate}%)</td>
                        <td>
                            <span class="status-badge status-${user.isActive !== false ? 'active' : 'inactive'}">
                                ${user.isActive !== false ? '🟢 Active' : '🔴 Inactive'}
                            </span>
                        </td>
                        <td>
                            <div class="user-actions">
                                <button class="btn-user-action" onclick="window.adminManager.toggleUserStatus('${user.id}')" title="Toggle Status">
                                    ⚙️
                                </button>
                                <button class="btn-user-action" onclick="window.adminManager.viewUserDetails('${user.id}')" title="View Details">
                                    👁️
                                </button>
                                <button class="btn-user-action" onclick="window.adminManager.deleteUser('${user.id}')" title="Delete User">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }));

            tbody.innerHTML = userRows.join('');
        } catch (error) {
            console.error('Failed to load users table:', error);
        }
    }

    async getUserChecklists(userId) {
        try {
            // Check if Firebase is properly initialized
            if (!window.db) {
                console.error('Firebase not initialized');
                return [];
            }
            
            const checklistsSnapshot = await window.db.collection('checklists')
                .where('userId', '==', userId)
                .get();
            
            const checklists = [];
            checklistsSnapshot.forEach(doc => {
                checklists.push({ id: doc.id, ...doc.data() });
            });
            
            return checklists;
        } catch (error) {
            console.error(`Failed to load checklists for user ${userId}:`, error);
            return [];
        }
    }

    async handleCreateUser() {
        try {
            // Check if Firebase is properly initialized
            if (!window.db) {
                console.error('Firebase not initialized');
                alert('Firebase connection error. Please refresh the page.');
                return;
            }
            
            const name = document.getElementById('newUserName').value.trim();
            const email = document.getElementById('newUserEmail').value.trim();
            const role = document.getElementById('newUserRole').value;
            const password = document.getElementById('newUserPassword').value;

            if (!name || !email || !password) {
                window.notificationManager.showNotification('Error', 'Please fill in all fields.', 'error');
                return;
            }

            // Check if user already exists
            const existingUserQuery = await window.db.collection('users').where('email', '==', email).get();
            if (!existingUserQuery.empty) {
                window.notificationManager.showNotification('Error', 'A user with this email already exists.', 'error');
                return;
            }

            // Create user in Firebase Auth
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const firebaseUser = userCredential.user;

            // Create user document in Firestore
            const newUser = {
                name,
                email,
                role: role || 'student',
                createdAt: new Date().toISOString(),
                isActive: true,
                lastLogin: null
            };

            await window.db.collection('users').doc(firebaseUser.uid).set(newUser);

            // Log user creation
            if (window.authManager) {
                await window.authManager.logSystemActivity('user_created', `User "${name}" created by admin`, firebaseUser.uid);
            }

            this.closeCreateUserModal();
            await this.loadAdminData();
            
            window.notificationManager.showNotification(
                'User Created',
                `${name} has been added as a ${role}.`,
                'success'
            );
        } catch (error) {
            console.error('Failed to create user:', error);
            const errorMessage = error.message || 'Failed to create user. Please try again.';
            window.notificationManager.showNotification(
                'Error',
                errorMessage,
                'error'
            );
        }
    }

    async toggleUserStatus(userId) {
        console.log('Toggle user status called for userId:', userId);
        
        // Check if admin manager and Firebase are properly initialized
        if (!window.db) {
            console.error('Firebase not initialized');
            alert('Firebase connection error. Please refresh the page.');
            return;
        }
        
        try {
            const userDoc = await window.db.collection('users').doc(userId).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                const currentStatus = userData.isActive !== false ? 'active' : 'inactive';
                
                // Show status selection modal
                const statusChoice = prompt(
                    `Current status: ${currentStatus.toUpperCase()}\n\nSelect new status:\n1. Active\n2. Inactive\n\nEnter 1 or 2:`,
                    currentStatus === 'active' ? '1' : '2'
                );
                
                if (statusChoice === null) {
                    console.log('User cancelled status change');
                    return;
                }
                
                let newStatus;
                if (statusChoice === '1') {
                    newStatus = true;
                } else if (statusChoice === '2') {
                    newStatus = false;
                } else {
                    alert('Invalid selection. Please enter 1 for Active or 2 for Inactive.');
                    return;
                }
                
                // Don't update if status is the same
                if ((userData.isActive !== false) === newStatus) {
                    console.log('Status unchanged');
                    return;
                }
                
                console.log('Updating user status from', userData.isActive, 'to', newStatus);
                
                await window.db.collection('users').doc(userId).update({
                    isActive: newStatus,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                console.log('User status updated successfully');
                
                // Refresh the table and stats
                await this.loadUsersTable();
                await this.updateAdminStats();
                
                // Log status change
                if (window.authManager) {
                    const action = newStatus ? 'user_activated' : 'user_deactivated';
                    await window.authManager.logSystemActivity(action, `User "${userData.name}" ${newStatus ? 'activated' : 'deactivated'} by admin`);
                }
                
                const status = newStatus ? 'activated' : 'deactivated';
                console.log('Showing notification for status change:', status);
                
                if (window.notificationManager) {
                    window.notificationManager.showNotification(
                        'User Status Updated',
                        `User "${userData.name}" has been ${status}.`,
                        'success'
                    );
                } else {
                    alert(`User "${userData.name}" has been ${status}.`);
                }
            } else {
                throw new Error('User not found');
            }
        } catch (error) {
            console.error('Failed to toggle user status:', error);
            const errorMessage = error.message || 'Failed to update user status. Please try again.';
            
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Error',
                    errorMessage,
                    'error'
                );
            } else {
                alert(errorMessage);
            }
        }
    }

    async viewUserDetails(userId) {
        try {
            // Check if Firebase is properly initialized
            if (!window.db) {
                console.error('Firebase not initialized');
                alert('Firebase connection error. Please refresh the page.');
                return;
            }
            
            const userDoc = await window.db.collection('users').doc(userId).get();
            
            if (userDoc.exists) {
                const user = { id: userDoc.id, ...userDoc.data() };
                const userChecklists = await this.getUserChecklists(userId);
                const userTasks = userChecklists.flatMap(c => c.tasks || []);
                
                const details = `
                    Name: ${user.name}
                    Email: ${user.email}
                    Role: ${user.role || 'student'}
                    Joined: ${new Date(user.createdAt).toLocaleDateString()}
                    Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    Status: ${user.isActive !== false ? 'Active' : 'Inactive'}
                    
                    Statistics:
                    - Checklists: ${userChecklists.length}
                    - Total Tasks: ${userTasks.length}
                    - Completed Tasks: ${userTasks.filter(t => t.completed).length}
                    - Completion Rate: ${userTasks.length > 0 ? Math.round((userTasks.filter(t => t.completed).length / userTasks.length) * 100) : 0}%
                `;
                
                alert(details);
            }
        } catch (error) {
            console.error('Failed to view user details:', error);
            const errorMessage = error.message || 'Failed to load user details. Please try again.';
            
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Error',
                    errorMessage,
                    'error'
                );
            } else {
                alert(errorMessage);
            }
        }
    }

    async deleteUser(userId) {
        console.log('Delete user called for userId:', userId);
        
        // Check if Firebase is properly initialized
        if (!window.db) {
            console.error('Firebase not initialized');
            alert('Firebase connection error. Please refresh the page.');
            return;
        }
        
        // First confirmation
        const firstConfirm = confirm('Are you sure you want to delete this user? This action cannot be undone and will remove all their data.');
        
        if (!firstConfirm) {
            console.log('User cancelled deletion');
            return;
        }
        
        // Get user data for second confirmation
        try {
            const userDoc = await window.db.collection('users').doc(userId).get();
            
            if (!userDoc.exists) {
                throw new Error('User not found');
            }
            
            const userData = userDoc.data();
            
            // Second confirmation with user name
            const secondConfirm = confirm(`This will permanently delete "${userData.name}" and all their data including:\n\n• User account\n• All checklists\n• All tasks\n• System logs\n\nClick OK to confirm deletion.`);
            
            if (!secondConfirm) {
                console.log('User cancelled deletion on second confirmation');
                return;
            }
            
            console.log('Deleting user:', userData.name);
            
            // Create a batch to delete all user data atomically
            const batch = window.db.batch();
            
            // Delete user's checklists
            const userChecklists = await window.db.collection('checklists')
                .where('userId', '==', userId)
                .get();
            
            console.log('Found', userChecklists.size, 'checklists to delete');
            
            userChecklists.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            // Delete user's system logs
            const userLogs = await window.db.collection('systemLogs')
                .where('userId', '==', userId)
                .get();
            
            console.log('Found', userLogs.size, 'logs to delete');
            
            userLogs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            // Delete user document
            batch.delete(window.db.collection('users').doc(userId));
            
            // Commit all deletions
            console.log('Committing batch deletion');
            await batch.commit();
            console.log('Batch deletion completed');
            
            // Log user deletion
            if (window.authManager) {
                await window.authManager.logSystemActivity('user_deleted', `User "${userData.name}" and all associated data deleted by admin`);
            }
            
            // Refresh admin data
            console.log('Refreshing admin data');
            await this.loadAdminData();
            
            // Show success notification
            console.log('Showing success notification');
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'User Deleted',
                    `${userData.name} and all associated data have been removed from the system.`,
                    'success'
                );
            } else {
                alert(`${userData.name} and all associated data have been removed from the system.`);
            }
            
        } catch (error) {
            console.error('Failed to delete user:', error);
            const errorMessage = error.message || 'Failed to delete user. Please try again.';
            
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Error',
                    errorMessage,
                    'error'
                );
            } else {
                alert(errorMessage);
            }
        }
    }

    async loadAnalytics() {
        try {
            const performanceMetrics = document.getElementById('performanceMetrics');
            if (!performanceMetrics) return;

            const users = await this.getAllUsers();
            const allChecklists = await this.getAllChecklists();
            const allTasks = allChecklists.flatMap(c => c.tasks || []);

            const metrics = [
                { label: 'Average Tasks per User', value: users.length > 0 ? Math.round(allTasks.length / users.length) : 0 },
                { label: 'Average Checklists per User', value: users.length > 0 ? Math.round(allChecklists.length / users.length) : 0 },
                { label: 'Most Popular Subject', value: this.getMostPopularSubject(allChecklists) },
                { label: 'System Uptime', value: '99.9%' },
                { label: 'Data Storage Used', value: await this.calculateStorageUsed() }
            ];

            performanceMetrics.innerHTML = metrics.map(metric => `
                <div class="metric-item">
                    <span class="metric-label">${metric.label}</span>
                    <span class="metric-value">${metric.value}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    }

    getMostPopularSubject(checklists) {
        const subjects = {};
        checklists.forEach(checklist => {
            subjects[checklist.subject] = (subjects[checklist.subject] || 0) + 1;
        });
        
        const sortedSubjects = Object.entries(subjects).sort((a, b) => b[1] - a[1]);
        return sortedSubjects.length > 0 ? sortedSubjects[0][0] : 'None';
    }

    async calculateStorageUsed() {
        try {
            // Calculate storage based on Firestore data
            const users = await this.getAllUsers();
            const checklists = await this.getAllChecklists();
            
            const totalData = JSON.stringify({ users, checklists });
            const sizeInKB = Math.round(totalData.length / 1024);
            return sizeInKB > 1024 ? `${Math.round(sizeInKB / 1024)} MB` : `${sizeInKB} KB`;
        } catch (error) {
            console.error('Failed to calculate storage:', error);
            return '0 KB';
        }
    }

    loadReports() {
        // Reports are handled by button clicks
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    closeCreateUserModal() {
        document.getElementById('createUserModal').classList.remove('active');
        document.getElementById('createUserForm').reset();
    }
}

// Firebase Data Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Wait for Firebase to be ready
        if (typeof firebase === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }
        
        // Listen for authentication state changes
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.handleAuthStateChange(user);
            } else {
                this.currentUser = null;
                this.showAuthModal();
            }
        });
        
        this.bindAuthEvents();
    }

    async logSystemActivity(action, details, userId = null) {
        try {
            // Check if Firebase is properly initialized
            if (!window.db) {
                console.error('Firebase not initialized');
                return;
            }
            
            const currentUser = userId || window.authManager?.getCurrentUser()?.id;
            
            await window.db.collection('systemLogs').add({
                action,
                details,
                userId: currentUser,
                timestamp: new Date().toISOString(),
                eventType: 'user_action'
            });
        } catch (error) {
            console.error('Failed to log system activity:', error);
        }
    }

    async handleAuthStateChange(user) {
        try {
            // Check if Firebase is properly initialized
            if (!window.db) {
                console.error('Firebase not initialized');
                this.showError('Firebase connection error. Please refresh the page.');
                return;
            }
            
            // Get user document from Firestore
            const userDoc = await window.db.collection('users').doc(user.uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.currentUser = {
                    id: user.uid,
                    name: userData.name || user.displayName || 'User',
                    email: user.email,
                    role: userData.role || 'student',
                    isActive: userData.isActive !== false
                };
                
                // Update last login
                await window.db.collection('users').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Log login activity
                await this.logSystemActivity('user_login', `User ${userData.name} logged in`, user.uid);
                
                this.showMainApp();
            } else {
                // New user - create user document
                const userData = {
                    name: user.displayName || 'User',
                    email: user.email,
                    role: currentRole || 'student',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    isActive: true
                };
                
                await window.db.collection('users').doc(user.uid).set(userData);
                
                // Log new user registration
                await this.logSystemActivity('user_registration', `New user ${userData.name} registered`, user.uid);
                
                this.currentUser = {
                    id: user.uid,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    isActive: userData.isActive
                };
                
                this.showMainApp();
            }
        } catch (error) {
            console.error('Error handling auth state change:', error);
            this.showError('Error loading user data. Please try again.');
        }
    }

    bindAuthEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Signup form
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showError('Please fill in all fields.');
            return;
        }

        try {
            // Check if Firebase is properly initialized
            if (!window.db) {
                console.error('Firebase not initialized');
                this.showError('Firebase connection error. Please refresh the page.');
                return;
            }
            
            // Sign in with Firebase Auth
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            
            // Check if user has the correct role
            const userDoc = await window.db.collection('users').doc(userCredential.user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.role !== currentRole) {
                    await firebase.auth().signOut();
                    this.showError(`This account is not registered as a ${currentRole}.`);
                    return;
                }
                
                if (userData.isActive === false) {
                    await firebase.auth().signOut();
                    this.showError('Your account has been deactivated. Please contact an administrator.');
                    return;
                }
            }
            
            this.showSuccess('Login successful!');
            // handleAuthStateChange will be called automatically
            
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed. Please try again.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = `No ${currentRole} account found with this email address.`;
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
            }
            
            this.showError(errorMessage);
        }
    }

    async handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!name || !email || !password || !confirmPassword) {
            this.showError('Please fill in all fields.');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match.');
            return;
        }

        try {
            // Check if Firebase is properly initialized
            if (!window.db) {
                console.error('Firebase not initialized');
                this.showError('Firebase connection error. Please refresh the page.');
                return;
            }
            
            // Create user with Firebase Auth
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            // Update user profile
            await userCredential.user.updateProfile({
                displayName: name
            });
            
            // Create user document in Firestore
            await window.db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                role: currentRole,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: true
            });
            
            // Log signup activity
            await this.logSystemActivity('user_signup', `User ${name} signed up`, userCredential.user.uid);
            
            this.showSuccess('Account created successfully!');
            // handleAuthStateChange will be called automatically
            
        } catch (error) {
            console.error('Signup error:', error);
            let errorMessage = 'Account creation failed. Please try again.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please choose a stronger password.';
                    break;
            }
            
            this.showError(errorMessage);
        }
    }

    async handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                const currentUserId = this.currentUser?.id;
                const currentUserName = this.currentUser?.name;
                
                // Log logout activity before signing out
                if (currentUserId) {
                    await this.logSystemActivity('user_logout', `User ${currentUserName} logged out`, currentUserId);
                }
                
                await firebase.auth().signOut();
                this.currentUser = null;
                
                // Reset managers
                if (window.checklistManager) {
                    window.checklistManager.checklists = [];
                    window.checklistManager.renderChecklists();
                    window.checklistManager.updateStats();
                }
                
                this.showAuthModal();
            } catch (error) {
                console.error('Logout error:', error);
                this.showError('Error logging out. Please try again.');
            }
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    showAuthModal() {
        document.getElementById('authModal').classList.add('active');
        document.querySelector('.header').style.display = 'none';
        document.getElementById('studentDashboard').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    showMainApp() {
        document.getElementById('authModal').classList.remove('active');
        document.querySelector('.header').style.display = 'block';
        
        // Update welcome message and header
        document.getElementById('userWelcome').textContent = `Welcome, ${this.currentUser.name}! (${this.currentUser.role})`;
        document.getElementById('headerSubtitle').textContent = this.currentUser.role === 'admin' ? 'Admin Panel' : 'Student Task Manager';
        
        // Show appropriate dashboard
        if (this.currentUser.role === 'admin') {
            document.getElementById('studentDashboard').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            document.getElementById('studentActions').style.display = 'none';
            document.getElementById('adminActions').style.display = 'flex';
            
            // Initialize admin manager
            if (!window.adminManager) {
                window.adminManager = new AdminManager();
            } else {
                window.adminManager.loadAdminData();
            }
        } else {
            document.getElementById('studentDashboard').style.display = 'block';
            document.getElementById('adminDashboard').style.display = 'none';
            document.getElementById('studentActions').style.display = 'flex';
            document.getElementById('adminActions').style.display = 'none';
            
            // Initialize student managers
            if (!window.checklistManager) {
                window.checklistManager = new ChecklistManager();
            } else {
                window.checklistManager.loadUserData();
            }
            
            if (!window.quoteManager) {
                window.quoteManager = new QuoteManager();
            }
        }
        
        // Initialize notification manager
        if (!window.notificationManager) {
            window.notificationManager = new NotificationManager();
        }
        
        // Update quote visibility based on settings
        setTimeout(() => {
            if (window.notificationManager) {
                window.notificationManager.updateQuoteVisibility();
            }
        }, 100);
    }

    showError(message) {
        this.removeMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const activeForm = document.querySelector('.auth-form:not([style*="display: none"])');
        activeForm.insertBefore(errorDiv, activeForm.firstChild);
    }

    showSuccess(message) {
        this.removeMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const activeForm = document.querySelector('.auth-form:not([style*="display: none"])');
        activeForm.insertBefore(successDiv, activeForm.firstChild);
    }

    removeMessages() {
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// ChecklistManager (simplified for space)
class ChecklistManager {
    constructor() {
        this.checklists = [];
        this.currentEditingId = null;
        this.currentTaskChecklistId = null;
        this.loadUserData();
        this.init();
    }

    async loadUserData() {
        try {
            const currentUser = window.authManager?.getCurrentUser();
            if (!currentUser) {
                this.checklists = [];
                this.renderChecklists();
                this.updateStats();
                return;
            }
            
            // Check if Firebase is properly initialized
            if (!window.db) {
                console.error('Firebase not initialized');
                this.checklists = [];
                this.renderChecklists();
                this.updateStats();
                return;
            }
            
            // Load checklists from Firestore
            const checklistsSnapshot = await window.db.collection('checklists')
                .where('userId', '==', currentUser.id)
                .orderBy('createdAt', 'desc')
                .get();
            
            this.checklists = checklistsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderChecklists();
            this.updateStats();
        } catch (error) {
            console.error('Failed to load checklists:', error);
            this.checklists = [];
            this.renderChecklists();
            this.updateStats();
        }
    }

    init() {
        this.renderChecklists();
        this.updateStats();
        this.bindEvents();
        
        // Add sample data only if user has no checklists
        if (this.checklists.length === 0) {
            this.addSampleData();
        }
    }

    bindEvents() {
        // Create checklist button
        const createBtn = document.getElementById('createChecklistBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.showCreateModal();
            });
        }

        // Form submissions
        const checklistForm = document.getElementById('checklistForm');
        if (checklistForm) {
            checklistForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleChecklistSubmit();
            });
        }

        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTaskSubmit();
            });
        }

        // Filters
        const searchInput = document.getElementById('searchInput');
        const subjectFilter = document.getElementById('subjectFilter');
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');

        if (searchInput) searchInput.addEventListener('input', () => this.filterChecklists());
        if (subjectFilter) subjectFilter.addEventListener('change', () => this.filterChecklists());
        if (statusFilter) statusFilter.addEventListener('change', () => this.filterChecklists());
        if (priorityFilter) priorityFilter.addEventListener('change', () => this.filterChecklists());
    }

    async saveToFirestore() {
        try {
            const currentUser = window.authManager?.getCurrentUser();
            if (!currentUser) return;
            
            // Check if Firebase is properly initialized
            if (!window.db) {
                console.error('Firebase not initialized');
                return;
            }
            
            // Save all checklists to Firestore
            const batch = window.db.batch();
            
            for (const checklist of this.checklists) {
                const checklistRef = window.db.collection('checklists').doc(checklist.id);
                batch.set(checklistRef, {
                    ...checklist,
                    userId: currentUser.id,
                    updatedAt: new Date().toISOString()
                });
            }
            
            await batch.commit();
        } catch (error) {
            console.error('Failed to save checklists to Firestore:', error);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async createChecklist(title, description, subject, priority, dueDate, reminderTime, tasks) {
        try {
            const currentUser = window.authManager?.getCurrentUser();
            if (!currentUser) return;

            // Check if Firebase is properly initialized
            if (!window.db) {
                console.error('Firebase not initialized');
                if (window.notificationManager) {
                    window.notificationManager.showNotification(
                        'Error',
                        'Firebase connection error. Please refresh the page.',
                        'error'
                    );
                }
                return;
            }

            const checklist = {
                title,
                description,
                subject,
                priority: priority || 'medium',
                dueDate,
                reminderTime,
                reminderSent: false,
                tasks: tasks.map(taskText => ({
                    id: this.generateId(),
                    text: taskText,
                    completed: false,
                    priority: 'medium',
                    dueDate: null,
                    reminderSent: false,
                    createdAt: new Date().toISOString()
                })),
                userId: currentUser.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Add to Firestore
            const docRef = await window.db.collection('checklists').add(checklist);
            checklist.id = docRef.id;

            // Update local array
            this.checklists.unshift(checklist);
            this.renderChecklists();
            this.updateStats();
            
            // Log checklist creation
            if (window.authManager) {
                await window.authManager.logSystemActivity('checklist_created', `Checklist "${title}" created`);
            }
            
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Checklist Created',
                    `"${title}" has been created successfully!`,
                    'success'
                );
            }
            
            return checklist;
        } catch (error) {
            console.error('Failed to create checklist:', error);
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Error',
                    'Failed to create checklist. Please try again.',
                    'error'
                );
            }
        }
    }

    async updateChecklist(id, updates) {
        try {
            const checklistIndex = this.checklists.findIndex(c => c.id === id);
            if (checklistIndex !== -1) {
                if (updates.dueDate || updates.reminderTime) {
                    updates.reminderSent = false;
                }
                
                updates.updatedAt = new Date().toISOString();
                
                // Update in Firestore
                await window.db.collection('checklists').doc(id).update(updates);
                
                // Update local array
                this.checklists[checklistIndex] = { ...this.checklists[checklistIndex], ...updates };
                this.renderChecklists();
                this.updateStats();
                
                // Log checklist update
                if (window.authManager) {
                    await window.authManager.logSystemActivity('checklist_updated', `Checklist "${this.checklists[checklistIndex].title}" updated`);
                }
                
                if (window.notificationManager) {
                    window.notificationManager.showNotification(
                        'Checklist Updated',
                        `"${this.checklists[checklistIndex].title}" has been updated!`,
                        'success'
                    );
                }
            }
        } catch (error) {
            console.error('Failed to update checklist:', error);
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Error',
                    'Failed to update checklist. Please try again.',
                    'error'
                );
            }
        }
    }

    async deleteChecklist(id) {
        try {
            const checklist = this.checklists.find(c => c.id === id);
            if (checklist && confirm('Are you sure you want to delete this checklist?')) {
                // Delete from Firestore
                await window.db.collection('checklists').doc(id).delete();
                
                // Update local array
                this.checklists = this.checklists.filter(c => c.id !== id);
                this.renderChecklists();
                this.updateStats();
                
                // Log checklist deletion
                if (window.authManager) {
                    await window.authManager.logSystemActivity('checklist_deleted', `Checklist "${checklist.title}" deleted`);
                }
                
                if (window.notificationManager) {
                    window.notificationManager.showNotification(
                        'Checklist Deleted',
                        `"${checklist.title}" has been deleted.`,
                        'info'
                    );
                }
            }
        } catch (error) {
            console.error('Failed to delete checklist:', error);
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Error',
                    'Failed to delete checklist. Please try again.',
                    'error'
                );
            }
        }
    }

    async addTask(checklistId, taskText, priority, dueDate) {
        try {
            const checklist = this.checklists.find(c => c.id === checklistId);
            if (checklist) {
                const task = {
                    id: this.generateId(),
                    text: taskText,
                    completed: false,
                    priority: priority || 'medium',
                    dueDate,
                    reminderSent: false,
                    createdAt: new Date().toISOString()
                };
                
                checklist.tasks.push(task);
                
                // Update in Firestore
                await window.db.collection('checklists').doc(checklistId).update({
                    tasks: checklist.tasks,
                    updatedAt: new Date().toISOString()
                });
                
                this.renderChecklists();
                this.updateStats();
                
                if (window.notificationManager) {
                    window.notificationManager.showNotification(
                        'Task Added',
                        `New task added to "${checklist.title}"`,
                        'success'
                    );
                }
            }
        } catch (error) {
            console.error('Failed to add task:', error);
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Error',
                    'Failed to add task. Please try again.',
                    'error'
                );
            }
        }
    }

    async toggleTask(checklistId, taskId) {
        try {
            const checklist = this.checklists.find(c => c.id === checklistId);
            if (checklist) {
                const task = checklist.tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = !task.completed;
                    task.completedAt = task.completed ? new Date().toISOString() : null;
                    
                    // Update in Firestore
                    await window.db.collection('checklists').doc(checklistId).update({
                        tasks: checklist.tasks,
                        updatedAt: new Date().toISOString()
                    });
                    
                    this.renderChecklists();
                    this.updateStats();
                    
                    // Log task completion/incompletion
                    if (window.authManager) {
                        const action = task.completed ? 'task_completed' : 'task_uncompleted';
                        const status = task.completed ? 'completed' : 'marked as incomplete';
                        await window.authManager.logSystemActivity(action, `Task "${task.text}" ${status} in checklist "${checklist.title}"`);
                    }
                    
                    // Log task deletion
                    if (window.authManager) {
                        await window.authManager.logSystemActivity('task_deleted', `Task "${task.text}" deleted from checklist "${checklist.title}"`);
                    }
                    
                    if (task.completed && window.notificationManager) {
                        window.notificationManager.showNotification(
                            'Task Completed! 🎉',
                            `"${task.text}" has been marked as complete!`,
                            'success'
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Failed to toggle task:', error);
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Error',
                    'Failed to update task. Please try again.',
                    'error'
                );
            }
        }
    }

    async deleteTask(checklistId, taskId) {
        try {
            const checklist = this.checklists.find(c => c.id === checklistId);
            if (checklist) {
                const task = checklist.tasks.find(t => t.id === taskId);
                if (task && confirm('Are you sure you want to delete this task?')) {
                    checklist.tasks = checklist.tasks.filter(t => t.id !== taskId);
                    
                    // Update in Firestore
                    await window.db.collection('checklists').doc(checklistId).update({
                        tasks: checklist.tasks,
                        updatedAt: new Date().toISOString()
                    });
                    
                    this.renderChecklists();
                    this.updateStats();
                    
                    if (window.notificationManager) {
                        window.notificationManager.showNotification(
                            'Task Deleted',
                            `Task has been removed from "${checklist.title}"`,
                            'info'
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
            if (window.notificationManager) {
                window.notificationManager.showNotification(
                    'Error',
                    'Failed to delete task. Please try again.',
                    'error'
                );
            }
        }
    }

    showCreateModal() {
        this.currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Create New Checklist';
        document.getElementById('submitBtnText').textContent = 'Create Checklist';
        document.getElementById('checklistForm').reset();
        this.resetTaskInputs();
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59);
        document.getElementById('checklistDueDate').value = tomorrow.toISOString().slice(0, 16);
        
        document.getElementById('checklistModal').classList.add('active');
    }

    showEditModal(checklistId) {
        const checklist = this.checklists.find(c => c.id === checklistId);
        if (!checklist) return;

        this.currentEditingId = checklistId;
        document.getElementById('modalTitle').textContent = 'Edit Checklist';
        document.getElementById('submitBtnText').textContent = 'Update Checklist';
        
        document.getElementById('checklistTitle').value = checklist.title;
        document.getElementById('checklistDescription').value = checklist.description || '';
        document.getElementById('checklistSubject').value = checklist.subject;
        document.getElementById('checklistPriority').value = checklist.priority || 'medium';
        document.getElementById('checklistDueDate').value = checklist.dueDate ? new Date(checklist.dueDate).toISOString().slice(0, 16) : '';
        document.getElementById('reminderTime').value = checklist.reminderTime || '';
        
        this.resetTaskInputs();
        checklist.tasks.forEach(task => {
            this.addTaskInput(task.text);
        });
        
        document.getElementById('checklistModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('checklistModal').classList.remove('active');
        this.currentEditingId = null;
    }

    showTaskModal(checklistId) {
        this.currentTaskChecklistId = checklistId;
        document.getElementById('taskText').value = '';
        document.getElementById('taskPriority').value = 'medium';
        document.getElementById('taskDueDate').value = '';
        document.getElementById('taskModal').classList.add('active');
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        this.currentTaskChecklistId = null;
    }

    handleChecklistSubmit() {
        const title = document.getElementById('checklistTitle').value.trim();
        const description = document.getElementById('checklistDescription').value.trim();
        const subject = document.getElementById('checklistSubject').value;
        const priority = document.getElementById('checklistPriority').value;
        const dueDate = document.getElementById('checklistDueDate').value;
        const reminderTime = document.getElementById('reminderTime').value;
        
        const taskInputs = document.querySelectorAll('.task-input');
        const tasks = Array.from(taskInputs)
            .map(input => input.value.trim())
            .filter(task => task.length > 0);

        if (!title || !subject) {
            alert('Please fill in all required fields.');
            return;
        }

        if (this.currentEditingId) {
            const updates = { title, description, subject, priority, dueDate, reminderTime };
            
            const checklist = this.checklists.find(c => c.id === this.currentEditingId);
            if (checklist) {
                updates.tasks = tasks.map(taskText => {
                    const existingTask = checklist.tasks.find(t => t.text === taskText);
                    if (existingTask) {
                        return existingTask;
                    }
                    return {
                        id: this.generateId(),
                        text: taskText,
                        completed: false,
                        priority: 'medium',
                        dueDate: null,
                        reminderSent: false,
                        createdAt: new Date().toISOString()
                    };
                });
            }
            
            this.updateChecklist(this.currentEditingId, updates);
        } else {
            this.createChecklist(title, description, subject, priority, dueDate, reminderTime, tasks);
        }

        this.closeModal();
    }

    handleTaskSubmit() {
        const taskText = document.getElementById('taskText').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        
        if (!taskText) {
            alert('Please enter a task description.');
            return;
        }

        if (this.currentTaskChecklistId) {
            this.addTask(this.currentTaskChecklistId, taskText, priority, dueDate);
            this.closeTaskModal();
        }
    }

    resetTaskInputs() {
        const tasksList = document.getElementById('tasksList');
        if (tasksList) {
            tasksList.innerHTML = `
                <div class="task-input-group">
                    <input type="text" placeholder="Enter a task..." class="task-input">
                    <button type="button" class="btn-remove-task" onclick="checklistManager.removeTaskInput(this)">&times;</button>
                </div>
            `;
        }
    }

    addTaskInput(value = '') {
        const tasksList = document.getElementById('tasksList');
        if (tasksList) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'task-input-group';
            inputGroup.innerHTML = `
                <input type="text" placeholder="Enter a task..." class="task-input" value="${value}">
                <button type="button" class="btn-remove-task" onclick="checklistManager.removeTaskInput(this)">&times;</button>
            `;
            tasksList.appendChild(inputGroup);
        }
    }

    removeTaskInput(button) {
        const tasksList = document.getElementById('tasksList');
        if (tasksList && tasksList.children.length > 1) {
            button.parentElement.remove();
        }
    }

    getTaskStatus(task) {
        if (task.completed) return 'completed';
        if (task.dueDate && new Date(task.dueDate) < new Date()) return 'overdue';
        if (task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)) return 'due-soon';
        return 'normal';
    }

    getChecklistStatus(checklist) {
        const now = new Date();
        if (checklist.dueDate) {
            const dueDate = new Date(checklist.dueDate);
            if (dueDate < now && checklist.tasks.some(t => !t.completed)) return 'overdue';
            if (dueDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) return 'due-soon';
        }
        return 'normal';
    }

    formatDueDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return 'Due tomorrow';
        if (diffDays <= 7) return `Due in ${diffDays} days`;
        
        return date.toLocaleDateString();
    }

    renderChecklists() {
        const grid = document.getElementById('checklistsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!grid || !emptyState) return;
        
        const filteredChecklists = this.getFilteredChecklists();
        
        if (filteredChecklists.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = filteredChecklists.map(checklist => {
            const completedTasks = checklist.tasks.filter(t => t.completed).length;
            const totalTasks = checklist.tasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const subjectEmoji = this.getSubjectEmoji(checklist.subject);
            const checklistStatus = this.getChecklistStatus(checklist);
            const priorityClass = `priority-${checklist.priority || 'medium'}`;

            return `
                <div class="checklist-card ${checklistStatus}">
                    <div class="checklist-header">
                        <div class="checklist-title">
                            <h3>${this.escapeHtml(checklist.title)}</h3>
                            <div class="checklist-actions">
                                <button class="btn btn-secondary btn-small" onclick="checklistManager.showEditModal('${checklist.id}')">
                                    ✏️
                                </button>
                                <button class="btn btn-danger btn-small" onclick="checklistManager.deleteChecklist('${checklist.id}')">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="checklist-meta">
                            <div class="subject-badge">
                                ${subjectEmoji} ${checklist.subject}
                            </div>
                            <div class="priority-badge ${priorityClass}">
                                ${this.getPriorityEmoji(checklist.priority)} ${this.capitalize(checklist.priority || 'medium')}
                            </div>
                            ${checklist.dueDate ? `<div class="due-badge due-${checklistStatus}">⏰ ${this.formatDueDate(checklist.dueDate)}</div>` : ''}
                        </div>
                        ${checklist.description ? `<p class="checklist-description">${this.escapeHtml(checklist.description)}</p>` : ''}
                    </div>
                    <div class="checklist-body">
                        <div class="progress-section">
                            <div class="progress-info">
                                <span class="progress-text">${completedTasks} of ${totalTasks} tasks completed</span>
                                <span class="progress-percentage">${progress}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </div>
                        <div class="tasks-preview">
                            ${checklist.tasks.slice(0, 5).map(task => {
                                const taskStatus = this.getTaskStatus(task);
                                const taskPriorityClass = `priority-${task.priority || 'medium'}`;
                                
                                return `
                                    <div class="task-item ${taskStatus}">
                                        <div class="task-checkbox ${task.completed ? 'completed' : ''}" 
                                             onclick="checklistManager.toggleTask('${checklist.id}', '${task.id}')"></div>
                                        <div class="task-content">
                                            <span class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</span>
                                            <div class="task-meta">
                                                <div class="priority-badge ${taskPriorityClass}">${this.getPriorityEmoji(task.priority)}</div>
                                                ${task.dueDate ? `<div class="due-badge due-${taskStatus}">⏰ ${this.formatDueDate(task.dueDate)}</div>` : ''}
                                            </div>
                                        </div>
                                        <div class="task-actions">
                                            <button class="btn-task" onclick="checklistManager.deleteTask('${checklist.id}', '${task.id}')" title="Delete task">
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                            ${checklist.tasks.length > 5 ? `<p class="task-item" style="color: #6b7280; font-style: italic;">... and ${checklist.tasks.length - 5} more tasks</p>` : ''}
                        </div>
                    </div>
                    <div class="checklist-footer">
                        <button class="add-task-btn" onclick="checklistManager.showTaskModal('${checklist.id}')">
                            + Add New Task
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getFilteredChecklists() {
        const searchInput = document.getElementById('searchInput');
        const subjectFilter = document.getElementById('subjectFilter');
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const subjectValue = subjectFilter ? subjectFilter.value : '';
        const statusValue = statusFilter ? statusFilter.value : '';
        const priorityValue = priorityFilter ? priorityFilter.value : '';

        return this.checklists.filter(checklist => {
            const matchesSearch = searchTerm === '' || 
                checklist.title.toLowerCase().includes(searchTerm) ||
                checklist.description?.toLowerCase().includes(searchTerm) ||
                checklist.tasks.some(task => task.text.toLowerCase().includes(searchTerm));

            const matchesSubject = subjectValue === '' || checklist.subject === subjectValue;
            const matchesPriority = priorityValue === '' || checklist.priority === priorityValue;

            let matchesStatus = true;
            if (statusValue === 'completed') {
                matchesStatus = checklist.tasks.length > 0 && checklist.tasks.every(task => task.completed);
            } else if (statusValue === 'incomplete') {
                matchesStatus = checklist.tasks.some(task => !task.completed);
            } else if (statusValue === 'overdue') {
                matchesStatus = this.getChecklistStatus(checklist) === 'overdue';
            } else if (statusValue === 'due-soon') {
                matchesStatus = this.getChecklistStatus(checklist) === 'due-soon';
            }

            return matchesSearch && matchesSubject && matchesStatus && matchesPriority;
        });
    }

    filterChecklists() {
        this.renderChecklists();
    }

    updateStats() {
        const totalChecklists = this.checklists.length;
        const allTasks = this.checklists.flatMap(c => c.tasks);
        const completedTasks = allTasks.filter(t => t.completed).length;
        const pendingTasks = allTasks.length - completedTasks;
        const completionRate = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;
        
        const now = new Date();
        const dueSoonTasks = allTasks.filter(task => {
            if (task.completed || !task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            const timeDiff = dueDate.getTime() - now.getTime();
            const hoursUntilDue = timeDiff / (1000 * 60 * 60);
            return hoursUntilDue <= 24 && hoursUntilDue > 0;
        }).length;

        this.updateElement('totalChecklists', totalChecklists);
        this.updateElement('completedTasks', completedTasks);
        this.updateElement('pendingTasks', pendingTasks);
        this.updateElement('completionRate', `${completionRate}%`);
        this.updateElement('dueSoonTasks', dueSoonTasks);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    getSubjectEmoji(subject) {
        const emojiMap = {
            'Mathematics': '📊',
            'Science': '🔬',
            'English': '📚',
            'History': '🏛️',
            'Art': '🎨',
            'Physical Education': '⚽',
            'Music': '🎵',
            'Computer Science': '💻',
            'General': '📋'
        };
        return emojiMap[subject] || '📋';
    }

    getPriorityEmoji(priority) {
        const emojiMap = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        };
        return emojiMap[priority || 'medium'];
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addSampleData() {
        this.createChecklist(
            'Math Homework - Chapter 5',
            'Complete exercises from algebra chapter',
            'Mathematics',
            'high',
            new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            '1440',
            ['Solve equations 1-15', 'Review quadratic formulas', 'Practice word problems', 'Check answers']
        );
        
        this.createChecklist(
            'Science Project',
            'Solar system model presentation',
            'Science',
            'medium',
            new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            '2880',
            ['Research planet facts', 'Build 3D model', 'Prepare presentation slides', 'Practice speech']
        );
    }
}

// Global functions for onclick handlers
window.showCreateModal = () => window.checklistManager?.showCreateModal();
window.closeModal = () => window.checklistManager?.closeModal();
window.closeTaskModal = () => window.checklistManager?.closeTaskModal();
window.closeNotificationModal = () => window.notificationManager?.closeSettingsModal();
window.closeReportModal = () => document.getElementById('reportModal')?.classList.remove('active');
window.closeCreateUserModal = () => window.adminManager?.closeCreateUserModal();

window.saveNotificationSettings = () => window.notificationManager?.saveSettingsFromModal();
window.downloadReport = () => console.log('Download report functionality would be implemented here');

// Admin functions
window.switchAdminTab = async (tabName) => {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Refresh data when switching to specific tabs
    if (window.adminManager) {
        if (tabName === 'users') {
            await window.adminManager.loadUsersTable();
        } else if (tabName === 'analytics') {
            await window.adminManager.loadAnalytics();
        }
    }
};

window.showCreateUserModal = () => document.getElementById('createUserModal')?.classList.add('active');
window.generateSystemReport = () => console.log('System report generation would be implemented here');
window.downloadUserActivityReport = () => console.log('User activity report download would be implemented here');
window.downloadPerformanceReport = () => console.log('Performance report download would be implemented here');
window.downloadAnalyticsReport = () => console.log('Analytics report download would be implemented here');
window.downloadUserManagementReport = () => console.log('User management report download would be implemented here');

// Auth form switching functions
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('authTitle').textContent = 'Welcome Back to EDUCHECK360';
    window.authManager?.removeMessages();
}

function showSignupForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Join EDUCHECK360';
    window.authManager?.removeMessages();
}

// Task input management functions
window.addTaskInput = (value = '') => window.checklistManager?.addTaskInput(value);
window.removeTaskInput = (button) => window.checklistManager?.removeTaskInput(button);

// Initialize the application
window.authManager = new AuthManager();

// Additional CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideOutNotification {
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;
document.head.appendChild(style);