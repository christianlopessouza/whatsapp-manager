interface TimeRange {
    start: string;
    end: string;
}

interface ShootingTimer {
    min: number;
    max: number;
}

interface AutosendInstance {
    time: TimeRange,
    shootingTimer:ShootingTimer,
    active: boolean,
    days: number[]
}

const defaultConfigAutosend: AutosendInstance = {
    time: {
        start: '09:00',
        end: '19:00'
    },
    shootingTimer: {
        min: 15,
        max: 30
    },
    active: true,
    days: [0, 1, 2, 3, 4, 5, 6]
}



export { AutosendInstance, defaultConfigAutosend, TimeRange, ShootingTimer };
