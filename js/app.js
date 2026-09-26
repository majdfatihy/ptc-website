// Sample tasks data
const tasks = [
    {
        id: 1,
        title: "شاهد إعلان عن منتج إلكتروني",
        description: "شاهد إعلان مدته دقيقة واحدة",
        reward: 0.5,
        duration: "1 دقيقة"
    },
    {
        id: 2,
        title: "أكمل استبيان عن تفضيلاتك",
        description: "أجب على 10 أسئلة بسيطة",
        reward: 2.5,
        duration: "5 دقائق"
    },
    {
        id: 3,
        title: "انقر على الصور الصحيحة",
        description: "حدد الصور التي تطابق الوصف",
        reward: 1.0,
        duration: "2 دقائق"
    },
    {
        id: 4,
        title: "اختبر تطبيق جديد",
        description: "حمل التطبيق واستخدمه لمدة دقيقة",
        reward: 3.0,
        duration: "10 دقائق"
    },
    {
        id: 5,
        title: "اشترك في قائمة بريدية",
        description: "اشترك باستخدام بريدك الإلكتروني",
        reward: 1.5,
        duration: "2 دقائق"
    },
    {
        id: 6,
        title: "اكتب تعليق عن منتج",
        description: "اكتب رأيك الصادق عن منتج معين",
        reward: 2.0,
        duration: "3 دقائق"
    }
];

// Load tasks on page load
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    setupFormHandler();
});

function loadTasks() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';

    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <div class="reward">💰 ${task.reward}$</div>
            <small>⏱️ ${task.duration}</small>
            <button onclick="startTask(${task.id})">ابدأ المهمة</button>
        `;
        tasksList.appendChild(taskCard);
    });
}

function startTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    alert(`تم تحديد المهمة: ${task.title}\nالمكافأة: ${task.reward}$`);
    // في الواقع، يجب توجيه المستخدم إلى صفحة المهمة
}

function setupFormHandler() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('شكراً للتسجيل! تحقق من بريدك الإلكتروني للتأكيد.');
            this.reset();
        });
    }
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});