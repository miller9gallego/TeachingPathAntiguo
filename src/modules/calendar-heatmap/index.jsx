import CalendarHeatmap from "react-calendar-heatmap";
import React from 'react'

const Calendar = ({ calendar: { endDate, values }, months, horizontal = false }) => {
    const daysWeek = ["Lun", "Mar", "Mier", "Jue", "Vie", "Sab", "Dom"]
    const monthsYear = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const monthsMiliseconds = 1000 * 60 * 60 * 24 * 30
    const newStartDate = new Date(endDate.getTime() - monthsMiliseconds * months)
    CalendarHeatmap.prototype.getHeight = function () {
        return 110
    };
    return (
        <CalendarHeatmap
            startDate={newStartDate}
            endDate={new Date(endDate)}
            horizontal={true}
            values={values}
            showWeekdayLabels={true}
            gutterSize={2}
            weekdayLabels={daysWeek}
            monthLabels={monthsYear}
        />
    );
};

export default Calendar