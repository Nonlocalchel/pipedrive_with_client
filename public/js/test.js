function fetchTestPostRequest(){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
        method: "post",
        headers: myHeaders,
        redirect: "follow",
        body: JSON.stringify({"title":"deal name",
            'dick_size':200
        })
    };

    fetch("https://v1.nocodeapi.com/api_sender_225/pipedrive/mAbJvzqkSftvEtlM/deals", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

function test(){alert(1)}

