// Sample room data
let rooms = [
    { id: 101, number: '101', type: 'Single', status: 'available', occupant: null },
    { id: 102, number: '102', type: 'Double', status: 'available', occupant: null },
    { id: 103, number: '103', type: 'Single', status: 'booked', occupant: 'John Doe' },
    { id: 104, number: '104', type: 'Double', status: 'available', occupant: null },
    { id: 105, number: '105', type: 'Single', status: 'booked', occupant: 'Jane Smith' },
    { id: 106, number: '106', type: 'Double', status: 'available', occupant: null }
];

let currentUser = null;
let maintenanceRequests = [];

// Login function
function login() {
    const role = document.getElementById('role').value;
    const userID = document.getElementById('userID').value;
    const password = document.getElementById('password').value;
    
    // Simple demo authentication
    if (role === 'student' && userID === '12345' && password === 'student') {
        currentUser = { id: userID, name: 'John Student', role: 'student', room: 101 };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = 'student-dashboard.html';
    } 
    else if (role === 'admin' && userID === 'admin123' && password === 'admin') {
        currentUser = { id: userID, name: 'Admin User', role: 'admin' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = 'admin-dashboard.html';
    }
    else {
        alert('Invalid credentials! Use: Student ID:12345, Password:student OR Admin ID:admin123, Password:admin');
    }
}

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
    }
    return JSON.parse(user);
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Load student dashboard
function loadStudentDashboard() {
    const user = checkAuth();
    document.getElementById('userName').textContent = user.name;
    
    // Load current room info
    const userRoom = rooms.find(r => r.occupant === user.name);
    if (userRoom) {
        document.getElementById('currentRoom').innerHTML = `
            <p><strong>Room Number:</strong> ${userRoom.number}</p>
            <p><strong>Room Type:</strong> ${userRoom.type}</p>
            <p><strong>Status:</strong> Currently Booked</p>
        `;
    } else {
        document.getElementById('currentRoom').innerHTML = '<p>No room assigned yet</p>';
    }
    
    // Load available rooms
    displayAvailableRooms();
    
    // Load maintenance requests
    displayMaintenanceRequests();
}

// Display available rooms
function displayAvailableRooms() {
    const availableRooms = rooms.filter(r => r.status === 'available');
    const roomList = document.getElementById('roomList');
    
    if (availableRooms.length === 0) {
        roomList.innerHTML = '<p>No rooms available at the moment</p>';
        return;
    }
    
    roomList.innerHTML = availableRooms.map(room => `
        <div class="room-card available" onclick="requestRoom(${room.id})">
            <h3>Room ${room.number}</h3>
            <p>Type: ${room.type}</p>
            <p style="color: #28a745;">✓ Available</p>
            <button class="submit-btn" style="margin-top: 10px;">Request This Room</button>
        </div>
    `).join('');
}

// Request a room
function requestRoom(roomId) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const room = rooms.find(r => r.id === roomId);
    
    if (confirm(`Would you like to request Room ${room.number}?`)) {
        room.status = 'booked';
        room.occupant = user.name;
        alert(`Room ${room.number} has been requested successfully!`);
        displayAvailableRooms();
        loadStudentDashboard();
    }
}

// Submit maintenance request
function submitMaintenance() {
    const issue = document.getElementById('maintenanceIssue').value;
    if (!issue) {
        alert('Please describe the issue');
        return;
    }
    
    const request = {
        id: Date.now(),
        student: JSON.parse(localStorage.getItem('currentUser')).name,
        issue: issue,
        status: 'pending',
        date: new Date().toLocaleDateString()
    };
    
    maintenanceRequests.push(request);
    localStorage.setItem('maintenanceRequests', JSON.stringify(maintenanceRequests));
    alert('Maintenance request submitted successfully!');
    document.getElementById('maintenanceIssue').value = '';
    displayMaintenanceRequests();
}

// Display maintenance requests
function displayMaintenanceRequests() {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
    const container = document.getElementById('maintenanceList');
    
    if (requests.length === 0) {
        container.innerHTML = '<p>No maintenance requests yet</p>';
        return;
    }
    
    container.innerHTML = requests.map(req => `
        <div class="room-card" style="margin-bottom: 10px;">
            <p><strong>Issue:</strong> ${req.issue}</p>
            <p><strong>Status:</strong> ${req.status}</p>
            <p><strong>Date:</strong> ${req.date}</p>
        </div>
    `).join('');
}

// Load admin dashboard
function loadAdminDashboard() {
    const user = checkAuth();
    document.getElementById('adminName').textContent = user.name;
    
    // Update stats
    const totalRooms = rooms.length;
    const bookedRooms = rooms.filter(r => r.status === 'booked').length;
    const availableRooms = totalRooms - bookedRooms;
    
    document.getElementById('totalRooms').textContent = totalRooms;
    document.getElementById('bookedRooms').textContent = bookedRooms;
    document.getElementById('availableRooms').textContent = availableRooms;
    
    // Display all rooms
    displayAllRooms();
    
    // Display pending maintenance
    displayPendingMaintenance();
}

// Display all rooms for admin
function displayAllRooms() {
    const roomList = document.getElementById('allRooms');
    roomList.innerHTML = rooms.map(room => `
        <div class="room-card ${room.status}">
            <h3>Room ${room.number}</h3>
            <p>Type: ${room.type}</p>
            <p>Status: ${room.status.toUpperCase()}</p>
            ${room.occupant ? `<p>Occupant: ${room.occupant}</p>` : ''}
            <button onclick="changeRoomStatus(${room.id})" class="submit-btn" style="margin-top: 10px; background: #667eea;">
                ${room.status === 'available' ? 'Book Room' : 'Make Available'}
            </button>
        </div>
    `).join('');
}

// Change room status (admin only)
function changeRoomStatus(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (room.status === 'available') {
        const occupant = prompt('Enter student name:');
        if (occupant) {
            room.status = 'booked';
            room.occupant = occupant;
        }
    } else {
        room.status = 'available';
        room.occupant = null;
    }
    displayAllRooms();
    loadAdminDashboard();
}

// Display pending maintenance for admin
function displayPendingMaintenance() {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
    const pending = requests.filter(r => r.status === 'pending');
    const container = document.getElementById('pendingMaintenance');
    
    if (pending.length === 0) {
        container.innerHTML = '<p>No pending maintenance requests</p>';
        return;
    }
    
    container.innerHTML = pending.map(req => `
        <div class="room-card" style="margin-bottom: 10px;">
            <p><strong>From:</strong> ${req.student}</p>
            <p><strong>Issue:</strong> ${req.issue}</p>
            <p><strong>Date:</strong> ${req.date}</p>
            <button onclick="resolveRequest(${req.id})" class="submit-btn" style="margin-top: 10px;">Mark as Resolved</button>
        </div>
    `).join('');
}

// Resolve maintenance request
function resolveRequest(requestId) {
    let requests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
    const request = requests.find(r => r.id === requestId);
    if (request) {
        request.status = 'resolved';
        localStorage.setItem('maintenanceRequests', JSON.stringify(requests));
        displayPendingMaintenance();
        alert('Request marked as resolved');
    }
}