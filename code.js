// Clear localStorage on every page load
localStorage.clear();

// Initialize parties with predefined values
const initialParties = [
    "ANC", "EFF", "DA", "MK", "UDM", "INKATHA", "Action SA", "COPE"
];

if (!localStorage.getItem('parties')) {
    localStorage.setItem('parties', JSON.stringify(initialParties));
}

// Event Listeners for Menu Navigation
document.getElementById('adminLogin').addEventListener('click', function() {
    document.querySelector('.menu').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
});

document.getElementById('voterLogin').addEventListener('click', function() {
    document.querySelector('.menu').classList.add('hidden');
    document.getElementById('voterForm').classList.remove('hidden');
});

// Voter Registration
document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const idNumber = document.getElementById('idNumber').value;
    const birthYear = parseInt(idNumber.substring(0, 2));
    
    if (idNumber.length !== 13 || isNaN(birthYear)) {
        showMessage('Invalid ID number. It must be 13 digits.');
        return;
    }
    
    if (birthYear > (new Date().getFullYear() % 100) - 18) {
        showMessage('You must be at least 18 years old to register.');
        return;
    }

    // Check for duplicate ID numbers
    const voters = loadVoters();
    if (voters.some(voter => voter.idNumber === idNumber)) {
        showMessage('ID number already exists.');
        return;
    }
    
    const voter = {
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        gender: document.getElementById('gender').value,
        idNumber: idNumber
    };

    saveVoter(voter);
    showMessage('Registration successful! You can now vote.');
    document.getElementById('voterForm').classList.add('hidden');
    document.getElementById('votingSection').classList.remove('hidden');
    populatePartySelect();

    // Reset the registration form for new users
    document.getElementById('registrationForm').reset();
});

// Voting Process
document.getElementById('votingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const selectedParty = document.getElementById('partySelect').value;

    if (selectedParty) {
        saveVote(selectedParty);
        showVoteMessage('Thank you for voting for ' + selectedParty + '!');

        // Reset the voting form for new users
        document.getElementById('votingForm').reset();

        setTimeout(() => {
            document.getElementById('votingSection').classList.add('hidden');
            document.querySelector('.menu').classList.remove('hidden');
            document.getElementById('partySelect').value = ''; // Reset selection
            document.getElementById('voteMessage').classList.add('hidden'); // Hide vote message
        }, 2000);
    } else {
        showVoteMessage('Please select a party to vote for.');
    }
});

// Admin Section Actions
document.getElementById('viewVoters').addEventListener('click', function() {
    displayRegisteredVoters();
    document.getElementById('voterList').classList.remove('hidden');
    document.getElementById('partyManagement').classList.add('hidden');
});

document.getElementById('viewParties').addEventListener('click', function() {
    document.getElementById('partyManagement').classList.remove('hidden');
    document.getElementById('voterList').classList.add('hidden');
    populatePartyList();
});

document.getElementById('countVotes').addEventListener('click', function() {
    updateVoteCounts();
    document.getElementById('voteCounts').classList.remove('hidden');
    document.getElementById('voterList').classList.add('hidden');
    document.getElementById('partyManagement').classList.add('hidden');
});

// Party Management
document.getElementById('partyForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const partyName = document.getElementById('partyName').value;

    let parties = JSON.parse(localStorage.getItem('parties')) || [];
    if (!parties.includes(partyName)) {
        parties.push(partyName);
        localStorage.setItem('parties', JSON.stringify(parties));
        populatePartyList();
    }
});

// Delete Party Functionality
document.getElementById('deleteParty').addEventListener('click', function() {
    const partyName = prompt('Enter the name of the party to delete:');
    let parties = JSON.parse(localStorage.getItem('parties')) || [];

    const index = parties.indexOf(partyName);
    if (index !== -1) {
        parties.splice(index, 1);
        localStorage.setItem('parties', JSON.stringify(parties));
        populatePartyList();
    } else {
        alert('Party not found.');
    }
});

document.getElementById('backToMenu').addEventListener('click', function() {
    document.getElementById('adminSection').classList.add('hidden');
    document.querySelector('.menu').classList.remove('hidden');
});

document.getElementById('backToMainFromRegistration').addEventListener('click', function() {
    document.getElementById('voterForm').classList.add('hidden');
    document.querySelector('.menu').classList.remove('hidden');
});

// Local Storage Functions
function saveVoter(voter) {
    let voters = JSON.parse(localStorage.getItem('registeredVoters')) || [];
    voters.push(voter);
    localStorage.setItem('registeredVoters', JSON.stringify(voters));
}

function loadVoters() {
    return JSON.parse(localStorage.getItem('registeredVoters')) || [];
}

function saveVote(party) {
    let votes = JSON.parse(localStorage.getItem('votes')) || {};
    votes[party] = (votes[party] || 0) + 1;
    localStorage.setItem('votes', JSON.stringify(votes));
}

function loadVotes() {
    return JSON.parse(localStorage.getItem('votes')) || {};
}

// Display Functions
function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden');
}

function showVoteMessage(message) {
    const voteMessageDiv = document.getElementById('voteMessage');
    voteMessageDiv.textContent = message;
    voteMessageDiv.classList.remove('hidden');
}

function displayRegisteredVoters() {
    const voterList = document.getElementById('voterList');
    voterList.innerHTML = '';
    const voters = loadVoters();
    if (voters.length === 0) {
        voterList.textContent = 'No registered voters.';
    } else {
        voters.forEach(voter => {
            const li = document.createElement('li');
            li.textContent = `${voter.name} ${voter.surname} (ID: ${voter.idNumber})`;
            voterList.appendChild(li);
        });
    }
    voterList.classList.remove('hidden');
}

function populatePartySelect() {
    const partySelect = document.getElementById('partySelect');
    partySelect.innerHTML = '<option value="">Select Party</option>'; // Reset options
    const parties = JSON.parse(localStorage.getItem('parties')) || [];
    parties.forEach(party => {
        const option = document.createElement('option');
        option.value = party;
        option.textContent = party;
        partySelect.appendChild(option);
    });
}

function populatePartyList() {
    const partyList = document.getElementById('partyList');
    partyList.innerHTML = '';
    const parties = JSON.parse(localStorage.getItem('parties')) || [];
    parties.forEach(party => {
        const li = document.createElement('li');
        li.textContent = party;
        partyList.appendChild(li);
    });
    partyList.classList.remove('hidden');
}

function updateVoteCounts() {
    const voteCountsDiv = document.getElementById('voteCounts');
    const votes = loadVotes();
    let voteCountsText = '<h3>Vote Counts</h3>';
    for (const party in votes) {
        voteCountsText += `${party}: ${votes[party]} votes<br>`;
    }
    voteCountsDiv.innerHTML = voteCountsText || 'No votes cast yet.';
}