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
        title: "Guess the Number",
        description: "The Number Guessing Game is an interactive Java console application where players try to guess a randomly generated number between 1 and 100",
        image: "https://github.com/padmapriyach2007-gif/portfolio/blob/main/Number%20guessing%20game.png",
        link: "https://lnkd.in/dtY3QxSm"
    },
    {
        title: "Student Grade Calculator",
        description: "The Student Performance & Grade Calculator is a Java console application designed to calculate a student's academic performance based on marks obtained in multiple subjects",
        image: "https://github.com/padmapriyach2007-gif/portfolio/blob/main/pic.png",
        link: "https://lnkd.in/dtN4Spe3"
    },
    {
        title: "ATM System",
        description: "The ATM Banking System is a Java-based console application that simulates basic ATM operations. It allows users to check their account balance, deposit money, withdraw money, and exit the system",
        image: "https://github.com/padmapriyach2007-gif/portfolio/blob/main/ATM%20pic.png",
        link: "https://lnkd.in/dRAYyYCB"
    },
    {
        title: "Currency Converter",
        description: "The Currency Converter is a Java-based console application that allows users to convert an amount from one currency to another.",
        image: "https://github.com/padmapriyach2007-gif/portfolio/blob/main/Currency%20converter.png",
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
