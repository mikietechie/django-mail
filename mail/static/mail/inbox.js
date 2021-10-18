document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('outbox'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', () => load_mailbox('compose'));
  
    // By default, load the inbox
    load_mailbox('inbox');
    document.querySelector("#compose-form").addEventListener("submit", (event)=>{
        event.preventDefault();
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: document.querySelector("#compose-recipients").value,
                subject: document.querySelector("#compose-subject").value,
                body: document.querySelector("#compose-body").value
            })
        })
        .then(response => {
            if (response.ok) {
                alert("Email Sent");
                loadOutboxView();
            } else {
                alert("Email failed to send! Sorry")
            }
        });
    })
  });
  
  function load_mailbox(mailbox) {
    if (mailbox == "inbox") {
        loadInboxView();   
    }else if (mailbox == "compose"){
        loadComposeView();
    }else if (mailbox == "outbox"){
        loadOutboxView();
    }else if (mailbox == "archive"){
        loadArchiveView();
    }
    
}

viewEmail = (email)=>{
    document.querySelectorAll(".mail-box").forEach((element)=>{element.style.display = 'none';});
    document.querySelector("#emailSubject").innerText = email.subject;
    document.querySelector("#emailDate").innerText = email.timestamp;
    document.querySelector("#emailBody").innerText = email.body;
    document.querySelector("#emailActions").innerHTML = "";
    if (email.sender == document.querySelector("#accountEmail").innerText) {
        document.querySelector("#emailParty").innerText = `To ${email.recipients}`;
    } else {
        let replyButton = document.createElement("button");
        let archiveButton = document.createElement("button");
        replyButton.classList = ["btn btn-outline-primary"];
        archiveButton.classList = ["btn btn-outline-primary"];
        replyButton.innerText = "Reply";
        if (email.archived) {
            archiveButton.innerText = "Un-Archive";
        } else {
            archiveButton.innerText = "Archive";
        }
        replyButton.addEventListener("click", ()=>{
            loadReplyView(email);
        })
        archiveButton.addEventListener("click", ()=>{
            archiveEmail(email);
        })
        document.querySelector("#emailActions").append(replyButton);
        document.querySelector("#emailActions").append(archiveButton);
        document.querySelector("#emailParty").innerText = `From ${email.sender}`;
    }
    document.querySelector("#emailBody").innerText = email.body;
    
    document.querySelector("#email-view").style.display = "block";
}
loadInboxView = ()=>{
    document.querySelectorAll(".mail-box").forEach((element)=>{element.style.display = 'none';});
    document.querySelector("#inbox-view").style.display = "block";
    loadInbox();
}
loadComposeView = ()=>{
    document.querySelectorAll(".mail-box").forEach((element)=>{element.style.display = 'none';});
    document.querySelector("#compose-form").reset();
    document.querySelector("#compose-view").style.display = "block";
}
loadArchiveView = ()=>{
    document.querySelectorAll(".mail-box").forEach((element)=>{element.style.display = 'none';});
    loadArchive();
    document.querySelector("#archive-view").style.display = "block";
}
loadOutboxView = ()=>{
    document.querySelectorAll(".mail-box").forEach((element)=>{element.style.display = 'none';});
    loadOutbox();
    document.querySelector("#outbox-view").style.display = "block";
}

loadReplyView = (email)=>{
    document.querySelectorAll(".mail-box").forEach((element)=>{element.style.display = 'none';});
    document.querySelector("#compose-recipients").value = email.sender;
    document.querySelector("#compose-subject").value = email.subject;
    document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    document.querySelector("#compose-view").style.display = "block";
}

archiveEmail = (email)=>{
    fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
        })
    })
    .then(response => {console.log(response )})
    loadInboxView();
}

loadInbox = ()=> {
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
        let container = document.querySelector("#inbox-view .container-fluid");
        container.innerHTML = "";
        for (const email of emails) {
            document.querySelector("#inbox-count").innerText = emails.length;
            const row = document.createElement("div");
            row.classList = ["row py-2 my-1 border border-success"];
            row.innerHTML = `
                <div class="col-sm-12">${email.subject}</div>
                <div class="col-sm-12">from ${email.sender} On ${email.timestamp}</div>
            `;
            if (email.read) {
                row.style.backgroundColor = "grey"
            } else {
                row.style.backgroundColor = "white"
            }
            row.addEventListener("click", ()=>{
                if (!email.read) {
                    fetch(`/emails/${email.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            read: true
                        })
                    })
                    .then(response => response.json());
                }
                viewEmail(email);
            })
            container.append(row);
        }

    });
}

loadOutbox = ()=> {
    fetch('/emails/sent')
    .then(response => response.json())
    .then(emails => {
        document.querySelector("#outbox-count").innerText = emails.length;
        let container = document.querySelector("#outbox-view .container-fluid");
        container.innerHTML = "";
        for (const email of emails) {
            const row = document.createElement("div");
            row.classList = ["row py-2 my-1 border border-success"];
            row.innerHTML = `
                <div class="col-sm-12">${email.subject}</div>
                <div class="col-sm-12">to ${email.recipients} On ${email.timestamp}</div>
            `;
            if (email.read) {
                row.style.backgroundColor = "grey"
            } else {
                row.style.backgroundColor = "white"
            }
            row.addEventListener("click", ()=>{
                viewEmail(email);
            })
            container.append(row);
        }

    });
}

loadArchive = ()=> {
    fetch('/emails/archive')
    .then(response => response.json())
    .then(emails => {
        document.querySelector("#archive-count").innerText = emails.length;
        let container = document.querySelector("#archive-view .container-fluid");
        container.innerHTML = "";
        for (const email of emails) {
            const row = document.createElement("div");
            row.classList = ["row py-2 my-1 border border-success"];
            row.innerHTML = `
                <div class="col-sm-12">${email.subject}</div>
                <div class="col-sm-12">from ${email.sender} On ${email.timestamp}</div>
            `;
            row.style.backgroundColor = "grey"
            row.addEventListener("click", ()=>{
                viewEmail(email);
            })
            container.append(row);
        }

    });
}
