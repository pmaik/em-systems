const DEFAULT_PROFILE_IMAGE = "./profile.png";
const employeesListWrapper = document.querySelector(".employees-list");
const employeesInfoWrapper = document.querySelector(".employees-info");
const employeeInfoLoading = document.querySelector(".employees-info-loading");

let employees = [];
let selelectedEmployee = null;
let previousSelectedEmployee = null;

const fetchEmployees = async () => {
    try {
        const response = await fetch("https://dummyjson.com/users");

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching employees:", error);
        return null;
    }
};

const getUpdatedEmployees = (result) =>
    result?.users.map((users) => ({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        imageUrl: users.image,
        email: users.email,
        phone: users.phone,
        age: users.age,
        dob: "10-08-1996",
        salary: 1500000,
        address: users.address.address,
    }));

const renderEmployeesList = (employees) => {
    if (!employees) return;

    employeesListWrapper.innerHTML = ""; // Clear previous content

    employees.forEach((employee, index) => {
        const employeeName = document.createElement("span");
        employeeName.classList.add("employee-name");
        employeeName.setAttribute("key", employee?.id);
        employeeName.setAttribute("id", employee?.id);

        employeeName.innerHTML = `${employee?.firstName} ${employee?.lastName} <i class="employee-delete">❌</i>`;

        if (!previousSelectedEmployee && index === 0) {
            employeeName.classList.add("selected-employee");
            previousSelectedEmployee = employeeName;
            selelectedEmployee = employee;
        } else if (
            previousSelectedEmployee &&
            parseInt(previousSelectedEmployee?.id, 10) === employee?.id
        ) {
            employeeName.classList.add("selected-employee");
            previousSelectedEmployee = employeeName;
        }

        employeesListWrapper.appendChild(employeeName);
    });
};

const renderEmployeesInfo = (employee) => {
    if (!employee) {
        employeeInfoLoading.classList.remove("hide");
        employeeInfoLoading.textContent = "No data found";
        employeesInfoWrapper.style.display = "none";
        return;
    }

    employeeInfoLoading.classList.add("hide");
    employeesInfoWrapper.style.display = "flex";
    employeesInfoWrapper.style.visibility = "visible";

    const employeeImage = document.querySelector(".employee-info-image");
    const employeeName = document.querySelector(".employee-info-name");
    const employeeEmail = document.querySelector(".employee-email");
    const employeePhone = document.querySelector(".employee-phone");
    const employeeSalary = document.querySelector(".employee-salary");
    const employeeAddress = document.querySelector(".employee-address");
    const employeeDob = document.querySelector(".employee-dob");

    employeeImage.setAttribute("src", employee?.imageUrl);
    employeeName.textContent = `${employee?.firstName} ${employee?.lastName} (${employee.age} years old)`;
    employeeEmail.textContent = `Email: ${employee.email}`;
    employeePhone.textContent = `Phone: ${employee.phone}`;
    employeeSalary.textContent = `Salary: ${employee?.salary || "-"}`;
    employeeAddress.textContent = `Address: ${employee.address}`;
    employeeDob.textContent = `DOB: ${employee.dob}`;
};

(async function () {
    const result = await fetchEmployees();
    employees = getUpdatedEmployees(result);
    selelectedEmployee = employees[0];

    renderEmployeesList(employees);
    renderEmployeesInfo(selelectedEmployee);

    employeesListWrapper.addEventListener("click", (e) => {
        if (
            e.target.tagName === "SPAN" &&
            previousSelectedEmployee?.id !== e.target.id
        ) {
            if (previousSelectedEmployee) {
                previousSelectedEmployee.classList.remove("selected-employee");
                previousSelectedEmployee = null;
                selelectedEmployee = null;
            }
            console.log(previousSelectedEmployee, previousSelectedEmployee?.id);

            selelectedEmployee = employees.find(
                (employee) => employee.id === parseInt(e.target.id, 10)
            );

            const selelectedEmployeeSpan = document.getElementById(e.target.id);
            selelectedEmployeeSpan.classList.add("selected-employee");

            previousSelectedEmployee = selelectedEmployeeSpan;
            renderEmployeesInfo(selelectedEmployee);
        }

        if (e.target.tagName === "I") {
            const employeeIdToDelete = parseInt(e.target.parentNode.id, 10);

            employees = employees.filter(
                (emp) => emp?.id !== employeeIdToDelete
            );

            e.target.parentNode.remove();

            if (
                parseInt(previousSelectedEmployee.id, 10) === employeeIdToDelete
            ) {
                selelectedEmployee = employees[0] || null;
                previousSelectedEmployee = selelectedEmployee
                    ? document.getElementById(selelectedEmployee?.id)
                    : null;

                if (selelectedEmployee) {
                    previousSelectedEmployee.classList.add("selected-employee");
                    renderEmployeesInfo(selelectedEmployee);
                } else {
                    // Handle case when no employees are left
                    employeesListWrapper.innerHTML = `<p>No employee data present</p>`;
                    renderEmployeesInfo(null);
                }
            }
        }
    });

    const addEmployeeBtn = document.querySelector(".add-employee-btn");
    const popupOverlay = document.querySelector(".popup-overlay");
    const addEmployeeModal = document.querySelector(".add-employee-container");
    const addEmployeeForm = document.querySelector(".add-employee-form");

    function openPopup() {
        popupOverlay.style.display = "block";
        addEmployeeModal.style.display = "block";
    }
    function closePopup() {
        popupOverlay.style.display = "none";
        addEmployeeModal.style.display = "none";
    }

    addEmployeeBtn.addEventListener("click", openPopup);
    popupOverlay.addEventListener("click", (e) => {
        if (e.target.className === "popup-overlay") {
            closePopup();
        }
    });

    const dobInput = document.querySelector(".form-input-dob");
    const today = new Date();
    const minDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
    );
    dobInput.max = minDate.toISOString().split("T")[0]; // Set max date (18 years ago)

    addEmployeeForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const employeeData = Object.fromEntries(formData.entries());

        employeeData.imageUrl = employeeData.imageUrl || DEFAULT_PROFILE_IMAGE;
        employeeData.age =
            new Date().getFullYear() - parseInt(employeeData.dob.slice(0, 4));
        employeeData.id = (employees[employees.length - 1]?.id ?? 0) + 1;

        employees.push(employeeData);

        // previousSelectedEmployee = null;
        renderEmployeesList(employees);
        renderEmployeesInfo(selelectedEmployee);

        this.reset();
        closePopup();
    });
})();
