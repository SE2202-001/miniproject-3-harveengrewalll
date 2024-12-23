document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const fileNameDisplay = document.getElementById("fileName");
    const submitButton = document.getElementById("submitButton");
    const clickFileText = document.getElementById("clickFile");
    const jobListings = document.querySelector(".job-listings");
    const filterSkillDropdown = document.getElementById("filterSkill");
    const filterLevelDropdown = document.getElementById("filterLevel");
    const filterTypeDropdown = document.getElementById("filterType");
    const filterButton = document.getElementById("filterButton");
    const sortDropdown = document.getElementById("sort");
    const sortButton = document.getElementById("sortButton");

    let jobData = [];

    // Job class definition
    class Job {
        constructor({ Title, "Job Page Link": jobPageLink, "Job No": jobNo, Posted, Type, Level, "Estimated Time": estimatedTime, Skill, Detail }) {
            this.Title = Title || "N/A";
            this.JobPageLink = jobPageLink || "N/A";
            this.JobNo = jobNo || "N/A";
            this.Posted = Posted || "N/A";
            this.Type = Type || "N/A";
            this.Level = Level || "N/A";
            this.EstimatedTime = estimatedTime || "N/A";
            this.Skill = Skill || "N/A";
            this.Detail = Detail || "N/A";
        }

        // Method to get formatted job details
        getDetails() {
            let detailText = this.Detail.replace(/\n/g, "<br>").replace(
                /((http|https):\/\/[^\s<]+)/g,
                (match) => `<a href="${match}" target="_blank">${match}</a>`
            );
            return `
                <h3><a href="${this.JobPageLink}" target="_blank">${this.Title}</a></h3>
                <p><strong>Job No:</strong> ${this.JobNo}</p>
                <p><strong>Posted:</strong> ${this.Posted}</p>
                <p><strong>Type:</strong> ${this.Type}</p>
                <p><strong>Level:</strong> ${this.Level}</p>
                <p><strong>Estimated Time:</strong> ${this.EstimatedTime}</p>
                <p><strong>Skill Required:</strong> ${this.Skill}</p>
                <p><strong>Detail:</strong> <span>${detailText}</span></p>
            `;
        }

        // Method to get formatted posted time in minutes
        getFormattedPostedTime() {
            const timeMapping = {
                minute: 1,
                hour: 60,
                day: 1440,
                week: 10080,
                month: 43200
            };

            if (this.Posted === "N/A") return 0; // Return 0 if missing

            if (this.Posted.includes("minute")) {
                const minutes = parseInt(this.Posted.split(" ")[0], 10);
                return minutes;
            } else if (this.Posted.includes("hour")) {
                const hours = parseInt(this.Posted.split(" ")[0], 10);
                return hours * timeMapping.hour;
            } else if (this.Posted.includes("day")) {
                const days = parseInt(this.Posted.split(" ")[0], 10);
                return days * timeMapping.day;
            } else if (this.Posted.includes("week")) {
                const weeks = parseInt(this.Posted.split(" ")[0], 10);
                return weeks * timeMapping.week;
            } else if (this.Posted.includes("month")) {
                const months = parseInt(this.Posted.split(" ")[0], 10);
                return months * timeMapping.month;
            }

            return 0;
        }
    }

    clickFileText.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
        } else {
            fileNameDisplay.textContent = "No file selected";
        }
    });

    submitButton.addEventListener("click", () => {
        const file = fileInput.files[0];

        if (!file) {
            alert("Please select a JSON file first.");
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const rawData = JSON.parse(event.target.result);

                if (!Array.isArray(rawData)) {
                    throw new Error("Invalid format: Expected an array of jobs.");
                }

                // Convert raw data into Job instances
                jobData = rawData.map(job => new Job(job));

                displayJobs(jobData);
                populateSkillDropdown(jobData);
                populateLevelDropdown(jobData);
                populateTypeDropdown(jobData);
            } catch (error) {
                alert(`Error loading file: ${error.message}`);
                console.error("File parsing error:", error);
            }
        };

        reader.onerror = () => {
            alert("Error reading the file. Please try again.");
        };

        reader.readAsText(file);
    });

    function displayJobs(jobs) {
        jobListings.innerHTML = "<h2>Job Listings</h2>";

        if (jobs.length === 0) {
            const noJobsMessage = document.createElement("p");
            noJobsMessage.textContent = "No jobs to display.";
            jobListings.appendChild(noJobsMessage);
            return;
        }

        jobs.forEach((job) => {
            const jobItem = document.createElement("div");
            jobItem.className = "job-item";

            // Display job title with level in parentheses
            const jobTitleWithLevel = `${job.Title} (${job.Level})`;
            const jobTitleLink = document.createElement("a");
            jobTitleLink.href = "#";
            jobTitleLink.innerHTML = jobTitleWithLevel;
            jobTitleLink.addEventListener("click", (e) => {
                e.preventDefault();
                showJobDetailsModal(job);
            });

            jobItem.appendChild(jobTitleLink);
            jobListings.appendChild(jobItem);
        });
    }

    // Function to show job details in a modal window
    function showJobDetailsModal(job) {
        const modal = document.getElementById("myModal");
        const modalContent = modal.querySelector(".modal-content");

        // Set modal content with job details
        modalContent.innerHTML = `
            <span class="close-btn">&times;</span>
            <h2>${job.Title} (${job.Level})</h2>
            ${job.getDetails()}
        `;

        // Display the modal
        modal.style.display = "block";

        // Get the updated close button after the modal content is updated
        const closeBtn = modal.querySelector(".close-btn");
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });

        // Close modal if clicked outside of the modal content
        window.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    function populateSkillDropdown(jobs) {
        const skills = [...new Set(jobs.map(job => job.Skill).filter(Boolean))].sort();
        filterSkillDropdown.innerHTML = '<option value="">All Skills</option>';
        skills.forEach(skill => {
            const option = document.createElement("option");
            option.value = skill;
            option.textContent = skill;
            filterSkillDropdown.appendChild(option);
        });
    }

    function populateLevelDropdown(jobs) {
        const levels = [...new Set(jobs.map(job => job.Level).filter(Boolean))];
        filterLevelDropdown.innerHTML = '<option value="All">All Levels</option>';
        levels.forEach(level => {
            const option = document.createElement("option");
            option.value = level;
            option.textContent = level;
            filterLevelDropdown.appendChild(option);
        });
    }

    function populateTypeDropdown(jobs) {
        const types = [...new Set(jobs.map(job => job.Type).filter(Boolean))];
        filterTypeDropdown.innerHTML = '<option value="All">All Types</option>';
        types.forEach(type => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            filterTypeDropdown.appendChild(option);
        });
    }

    function sortJobs(jobs, sortOption) {
        if (sortOption === "alphabetical") {
            return jobs.sort((a, b) => a.Title.localeCompare(b.Title));
        } else if (sortOption === "reverseAlphabetical") {
            return jobs.sort((a, b) => b.Title.localeCompare(a.Title));
        } else if (sortOption === "postTimeNewest") {
            return jobs.sort((a, b) => b.getFormattedPostedTime() - a.getFormattedPostedTime());
        } else if (sortOption === "postTimeOldest") {
            return jobs.sort((a, b) => a.getFormattedPostedTime() - b.getFormattedPostedTime());
        }
        return jobs;
    }

    filterButton.addEventListener("click", () => {
        const selectedSkill = filterSkillDropdown.value;
        const selectedLevel = filterLevelDropdown.value;
        const selectedType = filterTypeDropdown.value;

        let filteredJobs = jobData.filter(job => {
            const matchesSkill = !selectedSkill || job.Skill === selectedSkill;
            const matchesLevel = selectedLevel === "All" || job.Level === selectedLevel;
            const matchesType = selectedType === "All" || job.Type === selectedType;
            return matchesSkill && matchesLevel && matchesType;
        });

        const sortOption = sortDropdown.value;
        const sortedJobs = sortJobs(filteredJobs, sortOption);
        displayJobs(sortedJobs);
    });

    sortButton.addEventListener("click", () => {
        const sortOption = sortDropdown.value;
        const sortedJobs = sortJobs(jobData, sortOption);
        displayJobs(sortedJobs);
    });
});
