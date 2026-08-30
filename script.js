// Smooth scrolling for navigation links
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
const myProjects = [
    {
        title: "Java Number Guessing Game",
        description: "A multi-level console game featuring attempt limits and input validation.",
        image: "https://via.placeholder.com/600x300?text=Number+Guessing+Game",
        link: "https://lnkd.in/dtY3QxSm"
    },
    {
        title: "Student Performance Report",
        description: "An object-oriented Java application to calculate total marks, GPA, and class distinctions.",
        image: "https://via.placeholder.com/600x300?text=Performance+Report",
        link: "https://lnkd.in/dtN4Spe3"
    },
    {
        title: "DecodeLabs Internship Tasks",
        description: "Core Java applications developed during my DecodeLabs internship.",
        image: "https://via.placeholder.com/600x300?text=DecodeLabs+Projects",
        link: "https://lnkd.in/dRAYyYCB"
    },
    {
        title: "Emotion Conveyer Concept",
        description: "An application concept designed to analyze feelings and provide tailored motivation.",
        image: "https://via.placeholder.com/600x300?text=Emotion+Conveyer",
        link: "https://lnkd.in/dNiMwYuH"
    }
];

function renderProjects() {
    const container = document.getElementById('project-container');
    if (!container) return; // Safety check

    let htmlContent = '';

    myProjects.forEach(project => {
        htmlContent += `
            <div class="project-card">
                <img src="${project.image}" alt="${project.title}" class="project-image">
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <a href="${project.link}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">View on GitHub</a>
                </div>
            </div>
        `;
    });

    container.innerHTML = htmlContent;
}

// Run the function when the page loads
document.addEventListener('DOMContentLoaded', renderProjects);
