document.getElementById('signupButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default button click behavior

    var form = document.getElementById('signup-form');
    var email = document.getElementById('emailInput').value;

    // Send the email address to the server-side script for processing
    fetch('http://localhost:3001/save-email', { // Update the URL with the correct server endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
    })
    .then(function(response) {
        if (response.ok) {
            alert('Thank you for subscribing!');
        } else {
            alert('Error: Please try again later.');
        }
    })
    .catch(function(error) {
        alert('Error: Please try again later.');
        console.error(error);
    });
});
