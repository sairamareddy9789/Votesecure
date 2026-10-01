/* ===================================================== */
/* ================= DATABASE ========================== */
/* ===================================================== */

const STORAGE_KEY = "voteSecure_voters_v3";

const VOTES_KEY = "voteSecure_votes_v3";

const SETTINGS_KEY = "voteSecure_settings_v3";

const DEFAULT_MAX_VOTERS = 50;


/* ===================================================== */
/* ================= VOTERS ============================= */
/* ===================================================== */

function getVoters(){

    return JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];

}


function saveVoters(voters){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(voters)
    );

}


/* ===================================================== */
/* ================= VOTES ============================== */
/* ===================================================== */

function getVotes(){

    return JSON.parse(
        localStorage.getItem(VOTES_KEY)
    ) || [12,18,10];

}


function saveVotes(votes){

    localStorage.setItem(
        VOTES_KEY,
        JSON.stringify(votes)
    );

}


/* ===================================================== */
/* ================= SETTINGS =========================== */
/* ===================================================== */

function getElectionSettings(){

    const saved =
        JSON.parse(
            localStorage.getItem(SETTINGS_KEY)
        );


    if(saved){

        return saved;

    }


    return {

        votingEnabled:true,

        startTime:"",

        endTime:"",

        maxVoters:DEFAULT_MAX_VOTERS

    };

}


function saveElectionSettingsData(settings){

    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );

}


/* ===================================================== */
/* ================= CURRENT USER ======================= */
/* ===================================================== */

let currentVoter = null;

let selectedCandidate = null;

let generatedOTP = "";

let adminLoggedIn = false;


/* ===================================================== */
/* ================= VIEW CONTROL ====================== */
/* ===================================================== */

function showView(viewName){

    const views =
        document.querySelectorAll(".view");


    views.forEach(function(view){

        view.classList.remove("active");

    });


    const selectedView =
        document.getElementById(viewName);


    if(selectedView){

        selectedView.classList.add("active");

    }


    if(viewName === "dashboard"){

        updateDashboard();

    }


    if(viewName === "elections"){

        updateElectionPage();

    }


    if(viewName === "results"){

        updateResults();

    }


    if(viewName === "admin"){

        updateAdmin();

    }


    window.scrollTo(0,0);

}


/* ===================================================== */
/* ================= VOTER LOGIN ======================= */
/* ===================================================== */

function openLogin(){

    document
    .getElementById("loginModal")
    .classList.add("active");

}


function closeLogin(){

    document
    .getElementById("loginModal")
    .classList.remove("active");

}


/* ===================================================== */
/* ================= OTP ================================ */
/* ===================================================== */

function sendOTP(){

    const voterId =
        document
        .getElementById("loginVoterId")
        .value.trim();


    const name =
        document
        .getElementById("loginName")
        .value.trim();


    const email =
        document
        .getElementById("loginEmail")
        .value.trim();


    const mobile =
        document
        .getElementById("loginMobile")
        .value.trim();


    if(
        voterId === "" ||
        name === "" ||
        email === "" ||
        mobile === ""
    ){

        showToast(
            "Please enter all voter details."
        );

        return;

    }


    if(
        !/^[A-Za-z0-9-]{4,20}$/.test(voterId)
    ){

        showToast(
            "Invalid Voter ID."
        );

        return;

    }


    if(
        !/^[0-9]{10}$/.test(mobile)
    ){

        showToast(
            "Enter valid 10 digit mobile number."
        );

        return;

    }


    generatedOTP =
        String(
            Math.floor(
                100000 +
                Math.random()*900000
            )
        );


    document
    .getElementById("otpBox")
    .style.display = "block";


    document
    .getElementById("otpMessage")
    .innerText =
        "Demo OTP: " + generatedOTP;


    showToast(
        "OTP generated."
    );

}


/* ===================================================== */
/* ================= VOTER LOGIN ======================= */
/* ===================================================== */

function loginVoter(){

    const voterId =
        document
        .getElementById("loginVoterId")
        .value.trim();


    const name =
        document
        .getElementById("loginName")
        .value.trim();


    const email =
        document
        .getElementById("loginEmail")
        .value.trim();


    const mobile =
        document
        .getElementById("loginMobile")
        .value.trim();


    const otp =
        document
        .getElementById("loginOTP")
        .value.trim();


    if(
        voterId === "" ||
        name === "" ||
        email === "" ||
        mobile === ""
    ){

        showToast(
            "Please fill all voter details."
        );

        return;

    }


    if(generatedOTP === ""){

        showToast(
            "Please generate OTP first."
        );

        return;

    }


    if(otp !== generatedOTP){

        showToast(
            "Incorrect OTP."
        );

        return;

    }


    const voters =
        getVoters();


    const existingVoter =
        voters.find(function(voter){

            return (

                voter.voterId &&
                voter.voterId.toLowerCase()
                === voterId.toLowerCase()

                &&

                voter.email.toLowerCase()
                === email.toLowerCase()

                &&

                voter.mobile === mobile

            );

        });


    /* EXISTING VOTER */

    if(existingVoter){

        currentVoter =
            existingVoter;


        closeLogin();

        resetLoginForm();

        showView("dashboard");


        if(existingVoter.hasVoted){

            showToast(
                "Your election was already completed."
            );

        }

        return;

    }


    /* MAXIMUM VOTERS */

    const settings =
        getElectionSettings();


    const completedVoters =
        voters.filter(
            function(voter){

                return voter.hasVoted;

            }
        ).length;


    if(completedVoters >= settings.maxVoters){

        showToast(
            "Maximum voting limit has been reached."
        );

        return;

    }


    /* CREATE VOTER */

    const newVoter = {

        id:Date.now(),

        voterId:voterId,

        name:name,

        email:email,

        mobile:mobile,

        hasVoted:false,

        votedCandidate:null,

        loginTime:
            new Date().toLocaleString(),

        voteTime:null

    };


    voters.push(newVoter);

    saveVoters(voters);


    currentVoter =
        newVoter;


    closeLogin();

    resetLoginForm();

    showView("dashboard");


    showToast(
        "Login successful."
    );

}


/* ===================================================== */
/* ================= RESET LOGIN ======================= */
/* ===================================================== */

function resetLoginForm(){

    document.getElementById(
        "loginVoterId"
    ).value = "";


    document.getElementById(
        "loginName"
    ).value = "";


    document.getElementById(
        "loginEmail"
    ).value = "";


    document.getElementById(
        "loginMobile"
    ).value = "";


    document.getElementById(
        "loginOTP"
    ).value = "";


    document.getElementById(
        "otpBox"
    ).style.display = "none";


    generatedOTP = "";

}


/* ===================================================== */
/* ================= CHECK VOTING ACTIVE =============== */
/* ===================================================== */

function isVotingActive(){

    const settings =
        getElectionSettings();


    if(settings.votingEnabled === false){

        return false;

    }


    const now =
        new Date();


    if(settings.startTime){

        const start =
            new Date(settings.startTime);


        if(now < start){

            return false;

        }

    }


    if(settings.endTime){

        const end =
            new Date(settings.endTime);


        if(now > end){

            return false;

        }

    }


    const voters =
        getVoters();


    const completed =
        voters.filter(
            function(voter){

                return voter.hasVoted;

            }
        ).length;


    if(completed >= settings.maxVoters){

        return false;

    }


    return true;

}


/* ===================================================== */
/* ================= DASHBOARD ========================= */
/* ===================================================== */

function updateDashboard(){

    if(!currentVoter){

        showView("home");

        return;

    }


    document.getElementById(
        "dashboardName"
    ).innerText =
        currentVoter.name;


    document.getElementById(
        "profileVoterId"
    ).innerText =
        currentVoter.voterId;


    document.getElementById(
        "profileName"
    ).innerText =
        currentVoter.name;


    document.getElementById(
        "profileEmail"
    ).innerText =
        currentVoter.email;


    document.getElementById(
        "profileMobile"
    ).innerText =
        currentVoter.mobile;


    if(currentVoter.hasVoted){

        document.getElementById(
            "profileStatus"
        ).innerText =
            "✓ Voting Completed";


        document.getElementById(
            "readyBox"
        ).style.display =
            "none";


        document.getElementById(
            "completedBox"
        ).style.display =
            "block";

    }
    else{

        document.getElementById(
            "profileStatus"
        ).innerText =
            "Not Voted";


        document.getElementById(
            "readyBox"
        ).style.display =
            "block";


        document.getElementById(
            "completedBox"
        ).style.display =
            "none";

    }

}


/* ===================================================== */
/* ================= READY TO VOTE ===================== */
/* ===================================================== */

function readyToVote(){

    if(!currentVoter){

        showToast(
            "Please login first."
        );

        return;

    }


    if(currentVoter.hasVoted){

        showToast(
            "Your election was already completed."
        );

        return;

    }


    if(!isVotingActive()){

        showToast(
            "Voting is currently not active."
        );

        return;

    }


    selectedCandidate = null;

    showView("elections");

}


/* ===================================================== */
/* ================= ELECTION PAGE ===================== */
/* ===================================================== */

function updateElectionPage(){

    if(!currentVoter){

        showView("home");

        return;

    }


    if(!isVotingActive()){

        showView("dashboard");

        showToast(
            "Voting is currently closed."
        );

        return;

    }


    document.getElementById(
        "electionVoterName"
    ).innerText =
        currentVoter.name;


    document.getElementById(
        "electionStatus"
    ).innerText =
        "● Voting Active";

}


/* ===================================================== */
/* ================= SELECT CANDIDATE ================== */
/* ===================================================== */

function selectCandidate(index){

    if(!currentVoter){

        return;

    }


    if(currentVoter.hasVoted){

        showToast(
            "You have already voted."
        );

        return;

    }


    if(!isVotingActive()){

        showToast(
            "Voting is closed."
        );

        return;

    }


    selectedCandidate =
        index;


    for(let i=0;i<3;i++){

        document
        .getElementById(
            "candidate"+i
        )
        .classList.remove("selected");


        document
        .getElementById(
            "radio"+i
        )
        .checked = false;

    }


    document
    .getElementById(
        "candidate"+index
    )
    .classList.add("selected");


    document
    .getElementById(
        "radio"+index
    )
    .checked = true;


    const names = [

        "Candidate A",

        "Candidate B",

        "Candidate C"

    ];


    document.getElementById(
        "selectedCandidateText"
    ).innerText =
        names[index];


    document.getElementById(
        "confirmPanel"
    ).style.display =
        "block";

}


/* ===================================================== */
/* ================= CANCEL ============================ */
/* ===================================================== */

function cancelSelection(){

    selectedCandidate =
        null;


    for(let i=0;i<3;i++){

        document
        .getElementById(
            "candidate"+i
        )
        .classList.remove("selected");


        document
        .getElementById(
            "radio"+i
        )
        .checked = false;

    }


    document.getElementById(
        "confirmPanel"
    ).style.display =
        "none";

}


/* ===================================================== */
/* ================= CAST VOTE ========================= */
/* ===================================================== */

function castVote(){

    if(!currentVoter){

        showToast(
            "Please login first."
        );

        return;

    }


    if(!isVotingActive()){

        showToast(
            "Voting is currently closed."
        );

        showView("dashboard");

        return;

    }


    if(currentVoter.hasVoted){

        showToast(
            "Your election was already completed."
        );

        showView("dashboard");

        return;

    }


    if(selectedCandidate === null){

        showToast(
            "Please select a candidate."
        );

        return;

    }


    const settings =
        getElectionSettings();


    const voters =
        getVoters();


    const votedCount =
        voters.filter(
            function(voter){

                return voter.hasVoted;

            }
        ).length;


    if(votedCount >= settings.maxVoters){

        showToast(
            "Maximum voting limit reached."
        );

        showView("dashboard");

        return;

    }


    const voterIndex =
        voters.findIndex(
            function(voter){

                return voter.id === currentVoter.id;

            }
        );


    if(voterIndex === -1){

        showToast(
            "Voter record not found."
        );

        return;

    }


    if(voters[voterIndex].hasVoted){

        currentVoter =
            voters[voterIndex];


        showToast(
            "Your election was already completed."
        );

        showView("dashboard");

        return;

    }


    const votes =
        getVotes();


    votes[selectedCandidate]++;


    saveVotes(votes);


    voters[voterIndex].hasVoted =
        true;


    voters[voterIndex].votedCandidate =
        selectedCandidate;


    voters[voterIndex].voteTime =
        new Date().toLocaleString();


    saveVoters(voters);


    currentVoter =
        voters[voterIndex];


    showToast(
        "✓ Vote confirmed successfully!"
    );


    setTimeout(function(){

        selectedCandidate =
            null;

        showView("home");

    },1500);

}


/* ===================================================== */
/* ================= RESULTS =========================== */
/* ===================================================== */

function updateResults(){

    const votes =
        getVotes();


    const total =
        votes[0] +
        votes[1] +
        votes[2];


    document.getElementById(
        "resultA"
    ).innerText =
        votes[0] + " votes";


    document.getElementById(
        "resultB"
    ).innerText =
        votes[1] + " votes";


    document.getElementById(
        "resultC"
    ).innerText =
        votes[2] + " votes";


    let a = 0;

    let b = 0;

    let c = 0;


    if(total > 0){

        a =
            votes[0] / total * 100;

        b =
            votes[1] / total * 100;

        c =
            votes[2] / total * 100;

    }


    document.getElementById(
        "barA"
    ).style.width =
        a + "%";


    document.getElementById(
        "barB"
    ).style.width =
        b + "%";


    document.getElementById(
        "barC"
    ).style.width =
        c + "%";

}


/* ===================================================== */
/* ================= ADMIN LOGIN ======================= */
/* ===================================================== */

function openAdminLogin(){

    document
    .getElementById("adminModal")
    .classList.add("active");

}


function closeAdminLogin(){

    document
    .getElementById("adminModal")
    .classList.remove("active");

}


function loginAdmin(){

    const username =
        document
        .getElementById("adminUsername")
        .value.trim();


    const password =
        document
        .getElementById("adminPassword")
        .value;


    if(
        username === "admin" &&
        password === "admin123"
    ){

        adminLoggedIn =
            true;


        closeAdminLogin();

        showView("admin");


        showToast(
            "Admin login successful."
        );

    }
    else{

        showToast(
            "Invalid admin credentials."
        );

    }

}


/* ===================================================== */
/* ================= SAVE ADMIN SETTINGS =============== */
/* ===================================================== */

function saveElectionSettings(){

    const startTime =
        document.getElementById(
            "adminStartTime"
        ).value;


    const endTime =
        document.getElementById(
            "adminEndTime"
        ).value;


    const maxVoters =
        parseInt(
            document.getElementById(
                "adminMaxVoters"
            ).value
        );


    if(!maxVoters || maxVoters < 1){

        showToast(
            "Maximum voters must be at least 1."
        );

        return;

    }


    const voters =
        getVoters();


    const completed =
        voters.filter(
            function(voter){

                return voter.hasVoted;

            }
        ).length;


    if(maxVoters < completed){

        showToast(
            "Maximum voters cannot be lower than completed voters."
        );

        return;

    }


    if(startTime && endTime){

        const start =
            new Date(startTime);


        const end =
            new Date(endTime);


        if(end <= start){

            showToast(
                "End time must be after start time."
            );

            return;

        }

    }


    const voteA =
        parseInt(
            document.getElementById(
                "defaultVoteA"
            ).value
        );


    const voteB =
        parseInt(
            document.getElementById(
                "defaultVoteB"
            ).value
        );


    const voteC =
        parseInt(
            document.getElementById(
                "defaultVoteC"
            ).value
        );


    if(
        isNaN(voteA) ||
        isNaN(voteB) ||
        isNaN(voteC) ||
        voteA < 0 ||
        voteB < 0 ||
        voteC < 0
    ){

        showToast(
            "Default votes cannot be negative."
        );

        return;

    }


    const settings =
        getElectionSettings();


    settings.startTime =
        startTime;


    settings.endTime =
        endTime;


    settings.maxVoters =
        maxVoters;


    settings.votingEnabled =
        true;


    saveElectionSettingsData(
        settings
    );


    /*
       These are the current displayed
       vote counts in this demo.
    */

    saveVotes([
        voteA,
        voteB,
        voteC
    ]);


    updateAdmin();

    updateResults();


    showToast(
        "Election settings saved successfully."
    );

}


/* ===================================================== */
/* ================= START VOTING NOW ================== */
/* ===================================================== */

function startVotingNow(){

    const settings =
        getElectionSettings();


    settings.votingEnabled =
        true;


    settings.startTime =
        "";


    settings.endTime =
        "";


    saveElectionSettingsData(
        settings
    );


    updateAdmin();


    showToast(
        "🟢 Voting started now."
    );

}


/* ===================================================== */
/* ================= STOP VOTING ======================= */
/* ===================================================== */

function stopVoting(){

    const settings =
        getElectionSettings();


    settings.votingEnabled =
        false;


    saveElectionSettingsData(
        settings
    );


    updateAdmin();


    showToast(
        "🔴 Voting stopped by admin."
    );

}


/* ===================================================== */
/* ================= ADMIN DASHBOARD =================== */
/* ===================================================== */

function updateAdmin(){

    if(!adminLoggedIn){

        return;

    }


    const voters =
        getVoters();


    const votes =
        getVotes();


    const settings =
        getElectionSettings();


    const registered =
        voters.length;


    const voted =
        voters.filter(
            function(voter){

                return voter.hasVoted;

            }
        ).length;


    const remaining =
        Math.max(
            0,
            settings.maxVoters - voted
        );


    const totalVotes =
        votes[0] +
        votes[1] +
        votes[2];


    document.getElementById(
        "adminRegistered"
    ).innerText =
        registered;


    document.getElementById(
        "adminVoted"
    ).innerText =
        voted;


    document.getElementById(
        "adminRemaining"
    ).innerText =
        remaining;


    document.getElementById(
        "adminTotalVotes"
    ).innerText =
        totalVotes;


    /* PROGRESS */

    let progress = 0;


    if(settings.maxVoters > 0){

        progress =
            voted /
            settings.maxVoters *
            100;

    }


    if(progress > 100){

        progress = 100;

    }


    document.getElementById(
        "adminProgress"
    ).style.width =
        progress + "%";


    document.getElementById(
        "adminProgressText"
    ).innerText =
        progress.toFixed(1) +
        "% of allowed voters completed voting.";


    /* VOTE PERCENTAGES */

    let aPercent = 0;

    let bPercent = 0;

    let cPercent = 0;


    if(totalVotes > 0){

        aPercent =
            votes[0] /
            totalVotes *
            100;


        bPercent =
            votes[1] /
            totalVotes *
            100;


        cPercent =
            votes[2] /
            totalVotes *
            100;

    }


    document.getElementById(
        "adminA"
    ).innerText =
        votes[0];


    document.getElementById(
        "adminB"
    ).innerText =
        votes[1];


    document.getElementById(
        "adminC"
    ).innerText =
        votes[2];


    document.getElementById(
        "adminAPercent"
    ).innerText =
        aPercent.toFixed(1) + "%";


    document.getElementById(
        "adminBPercent"
    ).innerText =
        bPercent.toFixed(1) + "%";


    document.getElementById(
        "adminCPercent"
    ).innerText =
        cPercent.toFixed(1) + "%";


    /* LOAD SETTINGS */

    document.getElementById(
        "adminMaxVoters"
    ).value =
        settings.maxVoters;


    document.getElementById(
        "adminStartTime"
    ).value =
        settings.startTime || "";


    document.getElementById(
        "adminEndTime"
    ).value =
        settings.endTime || "";


    document.getElementById(
        "defaultVoteA"
    ).value =
        votes[0];


    document.getElementById(
        "defaultVoteB"
    ).value =
        votes[1];


    document.getElementById(
        "defaultVoteC"
    ).value =
        votes[2];


    /* STATUS */

    const status =
        document.getElementById(
            "adminElectionStatus"
        );


    const now =
        new Date();


    if(settings.votingEnabled === false){

        status.innerHTML =
            "🔴 <strong>Voting is STOPPED by Admin.</strong>";

    }
    else if(
        settings.startTime &&
        now < new Date(settings.startTime)
    ){

        status.innerHTML =
            "🟡 <strong>Voting has not started.</strong><br>" +
            "Start time: " +
            new Date(
                settings.startTime
            ).toLocaleString();

    }
    else if(
        settings.endTime &&
        now > new Date(settings.endTime)
    ){

        status.innerHTML =
            "🔴 <strong>Voting has ended.</strong><br>" +
            "End time: " +
            new Date(
                settings.endTime
            ).toLocaleString();

    }
    else if(voted >= settings.maxVoters){

        status.innerHTML =
            "🟠 <strong>Voting capacity is FULL.</strong><br>" +
            "Maximum allowed voters: " +
            settings.maxVoters;

    }
    else{

        status.innerHTML =
            "🟢 <strong>Voting is ACTIVE.</strong><br>" +
            "Remaining voter slots: " +
            remaining;

    }


    /* ACTIVITY */

    if(voted === 0){

        document.getElementById(
            "adminActivity"
        ).innerText =
            "No voters have completed voting yet.";

    }
    else{

        const completedVoters =
            voters.filter(
                function(voter){

                    return voter.hasVoted;

                }
            );


        const latestVoter =
            completedVoters[
                completedVoters.length - 1
            ];


        if(latestVoter){

            document.getElementById(
                "adminActivity"
            ).innerText =
                "Latest voting activity: " +
                latestVoter.name +
                " completed voting at " +
                latestVoter.voteTime +
                ".";

        }

    }

}


/* ===================================================== */
/* ================= ADMIN LOGOUT ====================== */
/* ===================================================== */

function logoutAdmin(){

    adminLoggedIn =
        false;


    showView("home");


    showToast(
        "Admin logged out."
    );

}


/* ===================================================== */
/* ================= VOTER LOGOUT ====================== */
/* ===================================================== */

function logoutVoter(){

    currentVoter =
        null;


    selectedCandidate =
        null;


    showView("home");


    showToast(
        "You have been logged out."
    );

}


/* ===================================================== */
/* ================= TOAST ============================= */
/* ===================================================== */

function showToast(message){

    const toast =
        document.getElementById(
            "toast"
        );


    toast.innerText =
        message;


    toast.style.display =
        "block";


    setTimeout(function(){

        toast.style.display =
            "none";

    },3000);

}


/* ===================================================== */
/* ================= INITIALIZE ======================== */
/* ===================================================== */

updateResults();


/* Refresh admin dashboard */

setInterval(function(){

    if(adminLoggedIn){

        updateAdmin();

    }

},5000);