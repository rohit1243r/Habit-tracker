// Default habits list
const DEFAULT_HABITS = [
    'Morning Exercise',
    'Meditation',
    'Read 30 Minutes',
    'Drink 8 Glasses Water',
    'Healthy Eating',
    'Evening Reflection',
    'No Social Media After 9pm',
    'Sleep 8 Hours',
    'Learn Something New',
    'Gratitude Journal',
    'Stretch/Yoga',
    'Follow-up Tasks'
];

// Data storage
let habitsData = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    generateDayHeaders();
    generateHabitRows();
    updateDailyScores();
    
    // Add event listeners for name and month inputs
    document.getElementById('name').addEventListener('input', saveData);
    document.getElementById('month').addEventListener('input', saveData);
    
    // Draw graph after a delay to ensure canvas is sized
    setTimeout(drawProgressGraph, 500);
});

// Generate day headers (1-31)
function generateDayHeaders() {
    const dayHeadersContainer = document.getElementById('day-headers');
    dayHeadersContainer.innerHTML = '';
    
    for (let day = 1; day <= 31; day++) {
        const headerCell = document.createElement('th');
        headerCell.className = 'day-header';
        headerCell.innerText = day;
        dayHeadersContainer.appendChild(headerCell);
    }
}

// Generate habit rows
function generateHabitRows() {
    const tableBody = document.getElementById('habit-table-body');
    tableBody.innerHTML = '';
    
    DEFAULT_HABITS.forEach((habitName, index) => {
        const habitId = `habit-${index}`;
        
        // Initialize habit data if not exists
        if (!habitsData[habitId]) {
            habitsData[habitId] = {
                name: habitName,
                days: new Array(31).fill(false)
            };
        }
        
        // Create table row
        const row = document.createElement('tr');
        
        // Habit name cell
        const habitCell = document.createElement('td');
        habitCell.className = 'habit-name';
        habitCell.dataset.habitId = habitId;
        habitCell.innerText = habitsData[habitId].name;
        habitCell.contentEditable = true;
        habitCell.title = 'Click to edit habit name';
        
        // Update habit name on change
        habitCell.addEventListener('blur', function() {
            habitsData[habitId].name = this.innerText || habitName;
            saveData();
        });
        
        habitCell.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
        
        row.appendChild(habitCell);
        
        // Day cells (1-31)
        for (let day = 0; day < 31; day++) {
            const dayCell = document.createElement('td');
            dayCell.style.padding = '0';
            dayCell.style.width = '32px';
            dayCell.style.minWidth = '32px';
            
            const dayBox = document.createElement('button');
            dayBox.className = 'day-box';
            dayBox.dataset.habitId = habitId;
            dayBox.dataset.day = day;
            
            if (habitsData[habitId].days[day]) {
                dayBox.classList.add('completed');
            }
            
            dayBox.addEventListener('click', function(e) {
                e.preventDefault();
                toggleHabitDay(habitId, day);
            });
            
            dayCell.appendChild(dayBox);
            row.appendChild(dayCell);
        }
        
        tableBody.appendChild(row);
    });
}

// Toggle habit completion for a day
function toggleHabitDay(habitId, day) {
    habitsData[habitId].days[day] = !habitsData[habitId].days[day];
    
    // Update button appearance
    const dayBox = document.querySelector(`[data-habit-id="${habitId}"][data-day="${day}"]`);
    if (dayBox) {
        dayBox.classList.toggle('completed');
    }
    
    saveData();
    updateDailyScores();
    drawProgressGraph();
}

// Calculate daily scores
function calculateDailyScores() {
    const scores = new Array(31).fill(0);
    
    Object.keys(habitsData).forEach(habitId => {
        if (habitId.startsWith('habit-') && habitsData[habitId].days) {
            habitsData[habitId].days.forEach((completed, day) => {
                if (completed) {
                    scores[day]++;
                }
            });
        }
    });
    
    return scores;
}

// Update daily scores display
function updateDailyScores() {
    const scores = calculateDailyScores();
    const dailyScoresContainer = document.getElementById('daily-scores');
    dailyScoresContainer.innerHTML = '';
    
    scores.forEach((count, day) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        
        const dayLabel = document.createElement('div');
        dayLabel.className = 'day';
        dayLabel.innerText = `Day ${day + 1}`;
        
        const countLabel = document.createElement('div');
        countLabel.className = 'count';
        countLabel.innerText = `${count}/${DEFAULT_HABITS.length}`;
        
        scoreItem.appendChild(dayLabel);
        scoreItem.appendChild(countLabel);
        dailyScoresContainer.appendChild(scoreItem);
    });
}

// Draw progress graph
function drawProgressGraph() {
    const canvas = document.getElementById('progressChart');
    const ctx = canvas.getContext('2d');
    const scores = calculateDailyScores();
    
    // Set canvas width and height to actual display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Constants
    const padding = 50;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    const maxScore = DEFAULT_HABITS.length;
    const pointSpacing = graphWidth / 30;
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= maxScore; i++) {
        const y = padding + (graphHeight * (maxScore - i)) / maxScore;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 30; i++) {
        const x = padding + (pointSpacing * i);
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw Y-axis labels
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= maxScore; i++) {
        const y = padding + (graphHeight * (maxScore - i)) / maxScore;
        ctx.fillText(i, padding - 10, y);
    }
    
    // Draw X-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= 30; i += 5) {
        const x = padding + (pointSpacing * i);
        ctx.fillText(i + 1, x, canvas.height - padding + 10);
    }
    
    // Draw axis labels
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Days', canvas.width / 2, canvas.height - 10);
    
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Habits Completed', -canvas.height / 2, 15);
    ctx.restore();
    
    // Draw line graph
    ctx.strokeStyle = '#0066cc';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(0, 102, 204, 0.1)';
    
    // Draw line and area
    ctx.beginPath();
    for (let day = 0; day < 31; day++) {
        const x = padding + (pointSpacing * day);
        const y = padding + graphHeight - (scores[day] / maxScore) * graphHeight;
        
        if (day === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#0066cc';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    for (let day = 0; day < 31; day++) {
        const x = padding + (pointSpacing * day);
        const y = padding + graphHeight - (scores[day] / maxScore) * graphHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

// Reset all habits
function resetAllHabits() {
    if (confirm('Are you sure you want to reset all habits? This cannot be undone.')) {
        Object.keys(habitsData).forEach(habitId => {
            habitsData[habitId].days = new Array(31).fill(false);
        });
        
        // Reset visual state
        document.querySelectorAll('.day-box.completed').forEach(box => {
            box.classList.remove('completed');
        });
        
        saveData();
        updateDailyScores();
        drawProgressGraph();
    }
}

// Save data to localStorage
function saveData() {
    habitsData.name = document.getElementById('name').value;
    habitsData.month = document.getElementById('month').value;
    localStorage.setItem('habitTrackerData', JSON.stringify(habitsData));
}

// Load data from localStorage
function loadData() {
    const stored = localStorage.getItem('habitTrackerData');
    if (stored) {
        habitsData = JSON.parse(stored);
    } else {
        // Initialize with default habits
        DEFAULT_HABITS.forEach((habitName, index) => {
            habitsData[`habit-${index}`] = {
                name: habitName,
                days: new Array(31).fill(false)
            };
        });
    }
    
    // Set name and month inputs
    document.getElementById('name').value = habitsData.name || '';
    document.getElementById('month').value = habitsData.month || '';
}

// Handle window resize for responsive graph
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        drawProgressGraph();
    }, 250);
});
