function addBall(params) {
    var ball_num = Math.floor(Math.random() * 11);

    var ball = document.createElement("img");
    ball.setAttribute('class', 'ball');
    ball.setAttribute('src', 'assets/images/ball-'+ball_num+'.png');
    ball.setAttribute('id', params.id);
    ball.setAttribute('data-toggle', 'popover-hover');
    ball.setAttribute('title', params.first_name+' '+params.last_name+'\n'+params.host);
    ball.setAttribute('data-content', params.msg);
    ball.style.left = params.position.x;
    ball.style.top = params.position.y;

    document.getElementById("tree").appendChild(ball);

    ball.addEventListener("click", e => {
        e.stopPropagation();
        $('#'+params.id).popover('toggle');
    });
}

function validateData(data) {

    if ( data.first_name === "" || data.last_name === "" ||
         data.host === "" || data.message === "" ||
         data.position.x === "" || data.position.y === ""
    ) {
        $("#modal-wish-hint").text("Fill all the gaps!");
        return false;
    }

    if (data.first_name.length >= 20) {
        $("#modal-wish-hint").text("Name is too long!");
        return false;
    }

    if (data.last_name.length >= 30) {
        $("#modal-wish-hint").text("Last name is too long!");
        return false;
    }

    if (data.host.length >= 30) {
        $("#modal-wish-hint").text("Local name is too long!");
        return false;
    }

    return true;
}

async function saveNewBall() {
    
        //let response = await fetch('http://ipinfo.io/ip');
        //let ip = await response.text();
        
        var ball = {
            first_name: $("#modal-wish-name").val(),
            last_name: $("#modal-wish-last-name").val(),
            msg: $("#modal-wish-message").val(),
            host: $("#modal-wish-host").val(),
            position: {
                x: $("#modal-wish-x-position").val()+'%',
                y: $("#modal-wish-y-position").val()+'%'
            },
            //ip: ip.slice(0, -1)
            ip: "0.0.0.0"
        }

        if (!validateData(ball)) {
            $("#modal-wish-hint").addClass("is-show");
            return false;
        }
        $("#modal-wish-hint").removeClass("is-show");

        ball.id = await firebase.database().ref('wishes').push(ball).key;

        addBall(ball);

        return true;
    }

function area(coords) {
    console.log(coords);
    // abs((x1*(y2-y3) + x2*(y3-y1)+ x3*(y1-y2))/2.0)
    return Math.abs((coords[0][0]*(coords[1][1]-coords[2][1]) + coords[1][0]*(coords[2][1]-coords[0][1]) + coords[2][0]*(coords[0][1]-coords[1][1]))/2.0);
}

function clickedOnTree(x, y) {
    var triangle = [ [ 45, 1 ], [ 9, 90 ], [ 82, 90 ] ];
    a = area(triangle);
    a1 = area([ [ x, y ], triangle[1], triangle[2] ]);
    a2 = area([ triangle[0], [ x, y ], triangle[2] ]);
    a3 = area([ triangle[0], triangle[1], [ x, y ] ]);

    return a == a1+a2+a3;
}

$(document).ready(function () {
    var mobile = (/iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
    if (!mobile) {
        document.getElementById("time_machine").style.display = "block"
    }
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const year = urlParams.get("year")
    var firebaseRef = ""

    if (isNumeric(year) && (year === "2020" || year === "2021")) {
        firebaseRef = "_bac_" + year
        document.getElementById("title").innerHTML = "<p>Happy New <b>" + year + "</b> Year!</p>"

        if (year === "2020") {
            document.getElementById("tm_1").innerHTML = "<button id=\"tm_1\" type=\"button\" onclick=\"timeMachine(2022)\">Back to 2022</button> <br>"
            document.getElementById("tm_2").innerHTML = "<button id=\"tm_2\" type=\"button\" onclick=\"timeMachine(2021)\">2021</button> <br>"
        } else if (year === "2021") {
            document.getElementById("tm_1").innerHTML = "<button id=\"tm_1\" type=\"button\" onclick=\"timeMachine(2022)\">Back to 2022</button> <br>"
            document.getElementById("tm_2").innerHTML = "<button id=\"tm_2\" type=\"button\" onclick=\"timeMachine(2020)\">2020</button> <br>"
        }
    } else {
        document.getElementById("tm_1").innerHTML = "<button id=\"tm_1\" type=\"button\" onclick=\"timeMachine(2020)\">2020</button> <br>"
        document.getElementById("tm_2").innerHTML = "<button id=\"tm_2\" type=\"button\" onclick=\"timeMachine(2021)\">2021</button> <br>"

    }
    firebase.initializeApp(firebaseConfig);
    var ref = firebase.database().ref("wishes" + firebaseRef);

    ref.once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            addBall({
                id: childSnapshot.key,
                first_name: childSnapshot.child("first_name").val(),
                last_name: childSnapshot.child("last_name").val(),
                msg: childSnapshot.child("msg").val(),
                host: childSnapshot.child("host").val(),
                position: {
                    x: childSnapshot.child("position").child("x").val(),
                    y: childSnapshot.child("position").child("y").val()
                }
            })

        });

        $('body').popover({
            html: false,
            trigger: 'hover',
            placement: 'left auto',
            selector: '[data-toggle="popover-hover"]'
        });


    });

    $("#submit").click( async function(e) {
        e.preventDefault();
        if (await saveNewBall()) {
            MicroModal.close('modal-wish');
            $("#modal-wish-form").trigger("reset");
        }
    });

    $("#modal__close").click( async function(e) {
        e.preventDefault();
        MicroModal.close('modal-wish');
    });

    var tree_img = document.getElementById("tree");
    tree_img.addEventListener("click", function (e) {
        var x = Math.floor((e.layerX - 0.03*this.clientWidth)*100/this.clientWidth);
        var y = Math.floor(e.layerY*100/this.clientHeight);
        const year = urlParams.get("year")
        if (clickedOnTree(x,y) && (year == null || year === "2022")) {
            $("#modal-wish-x-position").val(x);
            $("#modal-wish-y-position").val(y);
            MicroModal.show('modal-wish');
        }
    });

    snow.start();

    /* modal lib */
    MicroModal.init();
});

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function timeMachine(year) {
    if (!isNumeric(year + "")) return

    const url = location.protocol + '//' + location.host + location.pathname + "?year=" + year
    window.open(url,"_self")
}