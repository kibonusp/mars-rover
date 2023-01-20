const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

const delay = ms => new Promise(res => setTimeout(res, ms));

class Rover {
    constructor(xIndex, yIndex, w, h) {
        this.direction = 'N';
        this.w = w;
        this.h = h;
        let position = this.getPosition(xIndex, yIndex);
        this.xIndex = xIndex;
        this.yIndex = yIndex;
        this.x = position[0];
        this.y = position[1];
        this.rotation = 0;
        this.place([this.x, this.y]);
    }

    getPosition(xPos, yPos) {
        if ((xPos >= comprimento || yPos >= largura) || (xPos < 0 || yPos < 0))
            return `Position not within grid limits of ${comprimento}x${largura}`;
    
        const child = document.getElementsByClassName('child')[xPos*comprimento + yPos].getBoundingClientRect();
        const H = child.height;
        const W = child.width;
        const x = child.x;
        const y = child.y;
        
        const a = (H - this.h)/2;
        const b = (W - this.w)/2;
    
        return [x + b, y + a]
    }

    place(pos) {
        img.style.left = pos[0] + 'px';
        img.style.top = pos[1] + 'px';
        this.x = pos[0];
        this.y = pos[1];
    }

    move (finalPosIndex, sign, direction) {
        // Velocidade 78px/s
        return new Promise((resolve, reject) => {
            let finalPos = this.getPosition(finalPosIndex[0], finalPosIndex[1], this.w, this.h);
            let pos = [this.x, this.y]
            let step = 1.3*sign;
            let align;
            if (direction == 'h')
                align = 0;
            else
                align = 1;
            const interval = setInterval(() => {
                pos[align] += step;

                if (sign == -1) {
                    if (pos[align] < finalPos[align])
                        pos[align] = finalPos[align]
                }
                else {
                    if (pos[align] > finalPos[align])
                        pos[align] = finalPos[align];
                }

                this.place(pos);
                if (pos.toString() === finalPos.toString()) {
                    clearInterval(interval);
                    this.xIndex = finalPosIndex[0];
                    this.yIndex = finalPosIndex[1];
                    resolve();
                }
            }, 1000/60);
        })
    }

    async rotate(direction) {
        let directionRot = {
            0: 'N',
            90: 'E',
            180: 'S',
            270: 'W'
        }

        let rotationSpeed = 90;

        if (direction == 'L')
            this.rotation -= 90;
        else if (direction == 'R')
            this.rotation += 90;
        
        let timeSec = 90/rotationSpeed;
        img.style.transition = `transform ${timeSec}s linear`;
        
        img.style.transform = `rotate(${this.rotation}deg)`;
        await delay(timeSec*1000);

        let regularRotation;
        if (this.rotation <= 0)
            regularRotation = Math.ceil(Math.abs(this.rotation/360))*360 + this.rotation
        else
            regularRotation = ((this.rotation / 360) % 1)*360;

        this.direction = directionRot[regularRotation];
    }

    async moveCell() {
        let finalPosIndex = [this.xIndex, this.yIndex];
        let sign = 1;
        let direction;
        switch (this.direction) {
            case 'N':
                finalPosIndex[0] -= 1;
                sign = -1;
                direction = 'v';
                break;
            case 'E':
                finalPosIndex[1] += 1;
                sign = 1;
                direction = 'h';
                break;
            case 'S':
                finalPosIndex[0] += 1;
                sign = 1;
                direction = 'v';
                break;
            case 'W':
                finalPosIndex[1] -= 1;
                sign = -1;
                direction = 'h';
                break;
        }
        if ((finalPosIndex[0] < 0 || finalPosIndex[0] >= largura) || (finalPosIndex[1] < 0 || finalPosIndex[1] >= comprimento)) {
            console.log('Unable to make this movement');
            return;
        }
        await this.move(finalPosIndex, sign, direction);
    }
    async processInput(input) {
        if (! /^(L|R|M)*$/.test(input)) {
            alert("Give instruction with L, R and M commands. Example: LMMRM")
            return
        }
        await delay(500);
        for (let char of input) {
            await fetch('/movement', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    x: this.xIndex,
                    y: this.yIndex,
                    direction: this.direction,
                    nextMovement: char,
                    timestamp: Date.now()
                })
            })
            if(char == 'L' || char == 'R')
                await this.rotate(char);
            else if (char == 'M')
                await this.moveCell();
        }
        await fetch('/movement', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                x: this.xIndex,
                y: this.yIndex,
                direction: this.direction,
                timestamp: Date.now()
            })
        })
    }
}

function resizeHover() {
    let child = document.getElementsByClassName('child')[0].getBoundingClientRect();
    let H = child.height;

    img.style.minWidth = `$100px`;
    img.style.maxHeight = `${0.9*H}px`;
    imgBound = img.getBoundingClientRect();

    return {w: imgBound.width, h: imgBound.height};
}

// MAIN

const img = document.getElementsByClassName('rover')[0];
const comprimento = params.comprimento;
const largura = params.largura;

let sizes = resizeHover();
const rover = new Rover(0, 0, sizes.w, sizes.h);

const commandInput = document.getElementById('comando');
const commandButton = document.getElementById('comandoSubmit');

commandButton.addEventListener('click', () => {
    rover.processInput(commandInput.value);
})

const inicialInput = document.getElementById('inicial');
const inicialButton = document.getElementById('inicialSubmit');

window.onresize = () => {
    let position = rover.getPosition(rover.xIndex, rover.yIndex);
    rover.x = position[0];
    rover.y = position[1];
    rover.place([rover.x, rover.y]);
};

inicialButton.addEventListener('click', () => {
    if (! /^[0-9]+ [0-9]+ (N|S|W|E)$/.test(inicialInput.value)) {
        alert("Give instruction such as 1 2 N. Direction options are N, E, S and W.")
        return
    }

    let initialValues = inicialInput.value.split(" ");
    let xIndex = parseInt(initialValues[0]);
    let yIndex = parseInt(initialValues[1]);
    
    let position = rover.getPosition(xIndex, yIndex);

    if (typeof position == 'string') {
        alert(position);
        return;
    }

    rover.xIndex = xIndex;
    rover.yIndex = yIndex;
    rover.x = position[0];
    rover.y = position[1];

    rover.direction = initialValues[2];
    let directionRot = {
        'N': 0,
        'E': 90,
        'S': 180,
        'W': 270
    }

    rover.rotation = directionRot[rover.direction];
    img.style.transition = `none`;
    img.style.transform = `rotate(${rover.rotation}deg)`;
    rover.place([rover.x, rover.y]);
})