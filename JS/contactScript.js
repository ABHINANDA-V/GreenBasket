document.getElementById("formcontact").addEventListener("submit",function(event)
            {
                event.preventDefault(); // Prevent form from submitting normally
                
                var username=document.getElementById("name").value.trim();
                var email=document.getElementById("email").value.trim();
                var number=document.getElementById("number").value.trim(); 
                 var message=document.getElementById("message").value.trim(); 

                var nameerror=document.getElementById("nameerror");
                var emailerror=document.getElementById("emailerror");
                var numbererror=document.getElementById("numbererror");

                nameerror.textContent="";
                emailerror.textContent="";
                numbererror.textContent="";

                var isValid=true;

                if(username === "")
                {
                    nameerror.textContent="Please Enter your name";
                    isValid=false;
                }

                var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if(email === "")
                {
                    emailerror.textContent="Please Enter your Email";
                    isValid=false;
                }
                else if(!emailPattern.test(email))
                {
                    emailerror.textContent="Invalid Email Format";
                    isValid=false;

                }

                if(number === "")
                {
                    numbererror.textContent="Please Enter your Phone number";
                    isValid=false;
                }
                if(!isValid)
                {
                    return;
                }

                const templateParams = {
                    from_name: username,
                    from_email: email,
                    phone_number: number,
                    message: message
                };
                
                emailjs.send("service_ny3hhwb", "template_rdxv5m7", templateParams)
                .then(function(response)
                {
                    console.log("SUCCESS!", response.status, response.text);
                    alert("Message Sent Successfully!");
                    document.getElementById('formcontact').reset();
                })
                .catch(function(error)
                {
                    console.error("FAILED...", error);
                    alert("Failed to Send Message. Please Try Again.\nError: " + error.text);
                });
                
            });