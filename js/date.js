dinerApp.service('DateService', function () {
    const spanishDays = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const englishDays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const spanishMonths = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const dateType = typeof new Date();

    this.dateToTimeText = (date) => {
        if (typeof date !== dateType) return "ERROR - SE INTENTÓ CONVERTIR ALGO QUE NO ES UN DATE A UN DATE TEXT";

        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    }

    this.dateToDateText = (date) => {
        if (typeof date !== dateType) return "ERROR - SE INTENTÓ CONVERTIR ALGO QUE NO ES UN DATE A UN DATE TEXT";

        return `${spanishDays[date.getDay()]} ${date.getDate()} de ${spanishMonths[date.getMonth()]}`
    }

    this.dateToFullDateText = (date) => {
        return `${this.dateToDateText(date)} - ${this.dateToTimeText(date)}`
    }

    this.dateToSpanishDayOfWeek = date => {
        return spanishDays[date.getDay()];
    }

    // takes the date part (year, month, day) from source and sets it into destination
    this.copyDateInto = (destination, source) => {
        destination.setFullYear(source.getFullYear(), source.getMonth(), source.getDate());
    }

    this.dayOfWeekSpanishToEnglish = (day) => {
        const index = spanishDays.indexOf(day);
        return englishDays[index];
    }

    this.dayOfWeekEnglishToSpanish = (day) => {
        const index = englishDays.indexOf(day);
        return spanishDays[index];
    }
});
