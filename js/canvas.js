const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

Util = {
    createImage: (src) => {
        let res = new Image()
        res.src = src
        return res
    },
    setCursor: (type) => {
        document.body.style.cursor = type
    },
    drawText: (text, maxWidth, fontSize, font, color, x, y, lineHeight = 8) => {
        ctx.font = fontSize + "px " + font
        ctx.textAlign = "start";
        ctx.textBaseline = "top";
        ctx.fillStyle = color

        let curLine = ""
        let cur_y = y
        text = text.split("")
        for (let word of text) {
            if (ctx.measureText(curLine + " " + word).width >= maxWidth) {
                ctx.fillText(curLine, x, cur_y)
                cur_y += fontSize + lineHeight
                curLine = word
            } else {
                curLine += word
            }
        }
        if (curLine) {
            ctx.fillText(curLine, x, cur_y)
        }
    },
    estimateDimensions: (text, width, fontSize, font, lineHeight = 8) => {
        ctx.font = fontSize + "px " + font
        ctx.textAlign = "start";
        ctx.textBaseline = "top";

        let res_w = 0
        let res_y = 0

        let curLine = ""
        text = text.split("")
        for (let word of text) {
            if (ctx.measureText(curLine + " " + word).width >= width) {
                res_y += fontSize + lineHeight
                res_w = Math.max(res_w, ctx.measureText(curLine).width)
                curLine = word
            } else {
                curLine += word
            }
        }
        if (curLine) {
            res_y += fontSize
            res_w = Math.max(res_w, ctx.measureText(curLine).width)
        } else {
            res_y -= lineHeight
        }
        return [Math.ceil(res_w), res_y]
    },
    reset: () => {
        window.HoverEvents = new Map()
        window.ClickEvents = new Map()
        window.Blocks = new Map()
    }
}

// Fake jQuery
$ = (id) => {
    return Blocks.get(id)
}

Images = {
    BSD: Util.createImage("./static/BSD_Map.svg"),
    marker: fetch("./static/marker.txt").then(x => x.text()).then(x => Images.marker = x),
    person: Util.createImage("./static/person.svg"),
    car: Util.createImage("./static/car.svg"),
    outside: Util.createImage("./static/outside_cropped_cropped.jpeg")
}

HoverEvents = new Map()
ClickEvents = new Map()
Blocks = new Map()


Const = {
    amount: 0.5,
    normalTransform: [1, 0, 0, 1, 0, 0],
    schools: {
        "Medina Elementary School": {
            coords: [80, 175],
            type: "elementary"
        },
        "Clyde Hill Elementary School": {
            coords: [180, 120],
            type: "elementary"
        },
        "Cherry Crest Elementary School": {
            coords: [400, 100],
            type: "elementary"
        },
        "Ardmore Elementary School": {
            coords: [680, 100],
            type: "elementary"
        },
        "Sheerwood Forest Elementary School": {
            coords: [670, 130],
            type: "elementary"
        },
        "Bennett Elementary School": {
            coords: [780, 150],
            type: "elementary"
        },
        "Stevenson Elementary School": {
            coords: [550, 175],
            type: "elementary"
        },
        "Enatai Elementary School": {
            coords: [260, 300],
            type: "elementary"
        },
        "Woodridge Elementary School": {
            coords: [405, 290],
            type: "elementary"
        },
        "Lake Hills Elementary School": {
            coords: [500, 230],
            type: "elementary"
        },
        "Jingmei Elementary School": {
            coords: [580, 205],
            type: "elementary"
        },
        "Phantom Lake Elementary School": {
            coords: [660, 235],
            type: "elementary"
        },
        "Spiritridge Elementary School": {
            coords: [680, 305],
            type: "elementary"
        },
        "Newport Heights Elementary School": {
            coords: [355, 425],
            type: "elementary"
        },
        "Somerset Elementary School": {
            coords: [485, 375],
            type: "elementary"
        },
        "Eastgate Elementary School": {
            coords: [565, 355],
            type: "elementary"
        },
        "Puesta Del Sol Elementary School": {
            coords: [435, 345],
            type: "elementary"
        },
        "Bellevue Big Picture School": {
            coords: [560, 280],
            type: "middle"
        },
        "Chinook Middle School": {
            coords: [195, 150],
            type: "middle"
        },
        "Highland Middle School": {
            coords: [600, 140],
            type: "middle"
        },
        "Odle Middle School": {
            coords: [560, 185],
            type: "middle"
        },
        "Tillicum Middle School": {
            coords: [650, 255],
            type: "middle"
        },
        "Tyee Middle School": {
            coords: [465, 355],
            type: "middle"
        },
        "Bellevue High School": {
            coords: [255, 220],
            type: "high"
        },
        "Interlake High School": {
            coords: [650, 135],
            type: "high"
        },
        "The International School": {
            coords: [405, 220],
            type: "high"
        },
        "Newport High School": {
            coords: [400, 370],
            type: "high"
        },
        "Sammamish High School": {
            coords: [535, 210],
            type: "high"
        },
        "Bellevue School District Offices": {
            coords: [440, 185],
            type: "office"
        }
    },
    Image: {
        "elementary": "#DB4437",
        "middle": "#4285F4",
        "high": "#F4B400",
        "office": "#9900ff",
        "highlighted": "#1aa260"
    }
}

class Marker {
    constructor(school, name) {
        this.x = school.coords[0] - 23 / 2
        this.y = school.coords[1] - 33
        this.name = name
        this.school = school
        this.type = school.type
        this.tooltip = ""

        HoverEvents.set(
            (x, y) => {
                return ctx.isPointInPath(this.path, x - this.x, y - this.y)
            },
            [() => {
                this.onHover(this)
            }, () => {
                this.onUnHover(this)
            }]
        )
        ClickEvents.set(
            (x, y) => {
                return ctx.isPointInPath(this.path, x - this.x, y - this.y)
            },
            () => {
                this.onClick(this)
            }
        )
    }

    draw() {
        ctx.beginPath()
        ctx.fillStyle = Const.Image[this.type]
        this.path = new Path2D(Images.marker)
        ctx.translate(this.x, this.y)
        ctx.closePath()
        ctx.fill(this.path)
        ctx.translate(-this.x, -this.y)
    }

    onHover() {
        this.type = "highlighted"
        if (!this.tooltip) {
            let rect = canvas.getBoundingClientRect()
            this.tooltip = document.createElement("DIV")
            this.tooltip.classList.add("tooltip")
            this.tooltip.innerHTML = this.name
            this.tooltip.style.left = rect.left + this.x + 23 / 2 + "px"
            this.tooltip.style.top = rect.top + this.y + 33 + "px"
            document.body.appendChild(this.tooltip)
        }
    }

    onUnHover() {
        this.type = this.school.type
        if (this.tooltip) {
            this.tooltip.remove()
            this.tooltip = ""
        }
    }

    onClick() {
        if (this.name !== $("character").name) {
            Const.character.goto(...this.school.coords, this.school, this.name)
        }
    }
}

class Person {
    constructor(x, y, school, name, size = 40, speed = 20) {
        this.size = size
        this.x = x
        this.y = y
        this.speed = speed
        this.name = name
        this.cur = school

        this.goto_x = null
        this.goto_y = null
        this.ratio_x = null
        this.ratio_y = null
    }

    draw() {
        if (this.goto_x && this.goto_y && this.ratio_x && this.ratio_y) {
            if (Math.abs(this.x - this.goto_x) < 2 && Math.abs(this.y - this.goto_y) < 2) {
                this.x = this.goto_x
                this.y = this.goto_y
                this.goto_x = null
                this.goto_y = null
                this.ratio_x = null
                this.ratio_y = null
                $("EnterExit_Building").disabled = false
            } else {
                this.x += this.ratio_x
                this.y += this.ratio_y
            }
            ctx.drawImage(Images.car, this.x - this.size / 2, this.y - this.size, this.size, this.size)
        } else {
            ctx.drawImage(Images.person, this.x - this.size / 2, this.y - this.size, this.size, this.size)
        }
    }

    goto(x, y, school, name) {
        $("EnterExit_Building").disabled = true
        this.goto_x = x
        this.goto_y = y
        this.cur = school
        this.name = name
        this.ratio_x = (x - this.x) / this.speed
        this.ratio_y = (y - this.y) / this.speed
    }
}

class Button {
    constructor(text, x, y, textColor, color, maxWidth, fontSize, callback, transform = [1, 0, 0, 1, 0, 0], padding_h = 10, padding_v = 10, radii = 4) {
        this.text = text
        this.color = color
        this.textColor = textColor
        this.x = x
        this.y = y
        this.fontSize = fontSize
        let dimensions = Util.estimateDimensions(this.text, this.width - padding_h * 2, fontSize, "Roboto")
        this.width = dimensions[0] + padding_h * 2
        if (maxWidth < this.width) {
            dimensions = Util.estimateDimensions(this.text, maxWidth - padding_h * 2, fontSize, "Roboto")
            this.width = dimensions[0] + padding_h * 2
        }
        this.height = dimensions[1] + 2 * padding_v
        this.radii = radii
        this.padding_h = padding_h
        this.padding_v = padding_v
        this.opacity = 1
        this.onClick = callback
        this.disabled = false
        this.transform = transform
        HoverEvents.set(
            (x, y)=>{return this.transformIsPointInPath(this, x, y)},
            [() => {
                this.onHover(this)
            }, () => {
                this.onUnHover(this)
            }]
        )
        ClickEvents.set(
            (x, y)=>{return this.transformIsPointInPath(this, x, y)},
            callback
        )
    }

    transformIsPointInPath(me, x, y){ // quick workaround
        ctx.save()
        ctx.transform(...me.transform)
        let res = ctx.isPointInPath(me.path, x, y)
        ctx.restore()
        return res
    }

    draw() {
        ctx.beginPath()
        ctx.save()
        ctx.globalAlpha = this.disabled ? 0.5 : this.opacity
        ctx.fillStyle = this.color
        this.path = new Path2D()
        ctx.transform(...this.transform)
        this.path.roundRect(this.x, this.y, this.width, this.height, this.radii)
        ctx.fill(this.path)
        ctx.fillStyle = this.textColor
        Util.drawText(this.text, this.width, this.fontSize, "Roboto", this.textColor, this.x + this.padding_h, this.y + this.padding_v)
        ctx.globalAlpha = 1
        ctx.restore()
        ctx.closePath()
    }

    onHover() {
        this.opacity = 0.7
    }

    onUnHover() {
        this.opacity = 1
    }
}

class PublicApproval {
    constructor(amount = null) {
        if (amount) {
            Const.amount = amount
        }
    }

    draw() {
        this.amount = Math.min(1, Const.amount)
        ctx.beginPath()
        ctx.fillStyle = "#ffffff"
        ctx.strokeStyle = "#bdbdbd"
        ctx.lineWidth = 5;
        this.path = new Path2D()
        this.path.roundRect(15, 385, 20, 100, 100)
        ctx.stroke(this.path);
        ctx.fill(this.path)
        ctx.closePath()
        ctx.fillStyle = "#ff6e6e"
        let round;
        if (this.amount - 1 === 0) {
            round = [100, 100, 100, 100]
        } else {
            round = [0, 0, 100, 100]
        }
        ctx.roundRect(15, 385 + (1 - this.amount) * 100, 20, 100 - (1 - this.amount) * 100, round)
        ctx.fill()
    }
}

function init__map() {
    // Reset
    Util.reset()
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let school in Const.schools) {
        Blocks.set("MARKER_" + school, new Marker(Const.schools[school], school))
    }
    Const.character = new Person(...Const.schools["Bellevue School District Offices"].coords, Const.schools["Bellevue School District Offices"], "Bellevue School District Offices")
    Blocks.set("character", Const.character)
    Blocks.set("EnterExit_Building", new Button(
        "Enter Building", 50, canvas.height - 45, "#ffffff", "#000000", 500, 18,
        () => {
            init__desk()
            clearInterval(Const.loop)
            Const.loop = setInterval(draw__desk, 1000 / 60)
        }
    ))
    Blocks.set("Public_Approval", new PublicApproval())
}

function draw__map() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let gradient = ctx.createLinearGradient(0, 0, 0, 170);
    gradient.addColorStop(0, "#d1e0f3");
    gradient.addColorStop(1, "#b0ccfa");

    ctx.fillStyle = gradient

    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(Images.BSD, 20, 20, 850 - 20, 495 - 20)
    for (let [id, block] of Blocks.entries()) {
        block.draw()
    }
}

function init__desk() {
    Util.reset()
    Blocks.set("EnterExit_Building", new Button(
        "Exit Building", 50, canvas.height - 45, "#ffffff", "#000000", 500, 18,
        () => {
            init__map()
            clearInterval(Const.loop)
            Const.loop = setInterval(draw__map, 1000 / 60)
        }
    ))
    Blocks.set("Public_Approval", new PublicApproval())
}

function draw__desk() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background
    ctx.fillStyle = "#c7a336"
    ctx.fillRect(0, 150, canvas.width, canvas.height - 150)

    ctx.strokeStyle = "#8d8d8d"
    ctx.lineWidth = 10
    ctx.strokeRect(100, -10, canvas.width - 200, 130)

    ctx.globalAlpha = 0.8
    ctx.drawImage(Images.outside, 100, 0, 680, 120)
    ctx.globalAlpha = 1

    ctx.beginPath()
    ctx.lineWidth = 10
    ctx.moveTo(440, 120)
    ctx.lineTo(440, 0)
    ctx.moveTo(100, 0)
    ctx.lineTo(780, 0)
    ctx.stroke()
    ctx.closePath()

    // iPad
    ctx.beginPath()
    ctx.save()
    ctx.fillStyle = "#fff"
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 15
    ctx.transform(1, 0, -0.25, 1, 0, 0)
    ctx.roundRect(650, 180, 250, 280, 4)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
    ctx.closePath()


    for (let [id, block] of Blocks.entries()) {
        block.draw()
    }
}


window.onload = () => {
    init__desk()
    Const.loop = setInterval(draw__desk, 1000 / 60)
}

canvas.onmousemove = (e) => {
    let rect = canvas.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    for (let [check, invoke] of HoverEvents) {
        if (check(x, y)) {
            invoke[0]()
        } else {
            invoke[1]()
        }
    }
}

canvas.onclick = (e) => {
    let rect = canvas.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    for (let [check, invoke] of ClickEvents) {
        if (check(x, y)) {
            invoke()
        }
    }
}