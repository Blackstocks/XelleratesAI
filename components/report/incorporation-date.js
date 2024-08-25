import axios from 'axios';


function convertTextualDateToDate(text) {
    const dayMap = {
        "FIRST": 1,
        "SECOND": 2,
        "THIRD": 3,
        "FOURTH": 4,
        "FIFTH": 5,
        "SIXTH": 6,
        "SEVENTH": 7,
        "EIGHTH": 8,
        "NINTH": 9,
        "TENTH": 10,
        "ELEVENTH": 11,
        "TWELFTH": 12,
        "THIRTEENTH": 13,
        "FOURTEENTH": 14,
        "FIFTEENTH": 15,
        "SIXTEENTH": 16,
        "SEVENTEENTH": 17,
        "EIGHTEENTH": 18,
        "NINETEENTH": 19,
        "TWENTIETH": 20,
        "TWENTY-FIRST": 21,
        "TWENTY-SECOND": 22,
        "TWENTY-THIRD": 23,
        "TWENTY-FOURTH": 24,
        "TWENTY-FIFTH": 25,
        "TWENTY-SIXTH": 26,
        "TWENTY-SEVENTH": 27,
        "TWENTY-EIGHTH": 28,
        "TWENTY-NINTH": 29,
        "THIRTIETH": 30,
        "THIRTY-FIRST": 31
    };

    const monthMap = {
        "JANUARY": 0,
        "FEBRUARY": 1,
        "MARCH": 2,
        "APRIL": 3,
        "MAY": 4,
        "JUNE": 5,
        "JULY": 6,
        "AUGUST": 7,
        "SEPTEMBER": 8,
        "OCTOBER": 9,
        "NOVEMBER": 10,
        "DECEMBER": 11
    };

    const dayPattern = new RegExp(Object.keys(dayMap).join("|"), "i");
    const monthPattern = new RegExp(Object.keys(monthMap).join("|"), "i");
    const yearPattern = /(TWO THOUSAND(?: AND)?(?: \w+)?(?: \w+)?)/i;

    const dayMatch = text.match(dayPattern);
    const monthMatch = text.match(monthPattern);
    const yearMatch = text.match(yearPattern);

    // console.log("Day match:", dayMatch);
   //  console.log("Month match:", monthMatch);
    // console.log("Year match:", yearMatch);

    if (dayMatch && monthMatch && yearMatch) {
        const day = dayMap[dayMatch[0].toUpperCase()];
        const month = monthMap[monthMatch[0].toUpperCase()];

        const yearText = yearMatch[0].toUpperCase();
        // console.log("Year text extracted:", yearText);
        let year = 0;

        if (yearText.startsWith("TWO THOUSAND")) {
            year = 2000;

            const yearParts = yearText.split(" ");
        // console.log("Year parts:", yearParts);
            if (yearParts.includes("TWENTY")) {
                year += 20;

        const lastPart = yearParts[yearParts.length - 1];

        if (lastPart === "ONE") year += 1;
        else if (lastPart === "TWO") year += 2;
        else if (lastPart === "THREE") year += 3;
        else if (lastPart === "FOUR") year += 4;
        else if (lastPart === "FIVE") year += 5;
        else if (lastPart === "SIX") year += 6;
        else if (lastPart === "SEVEN") year += 7;
        else if (lastPart === "EIGHT") year += 8;
        else if (lastPart === "NINE") year += 9;
        else if (lastPart === "TEN") year += 10;
        else if (lastPart === "ELEVEN") year += 11;
        else if (lastPart === "TWELVE") year += 12;
        else if (lastPart === "THIRTEEN") year += 13;
        else if (lastPart === "FOURTEEN") year += 14;
        else if (lastPart === "FIFTEEN") year += 15;
        else if (lastPart === "SIXTEEN") year += 16;
        else if (lastPart === "SEVENTEEN") year += 17;
        else if (lastPart === "EIGHTEEN") year += 18;
        else if (lastPart === "NINETEEN") year += 19;
        else if (lastPart === "TWENTY") year += 20;
        else if (lastPart === "TWENTY-ONE") year += 21;
        else if (lastPart === "TWENTY-TWO") year += 22;
        else if (lastPart === "TWENTY-THREE") year += 23;
        else if (lastPart === "TWENTY-FOUR") year += 24;
            }
        }

        const formattedDate = `${day.toString().padStart(2, '0')}-${(month + 1).toString().padStart(2, '0')}-${year}`;
        return formattedDate;
    }

    return "NA";
}


const findIncorporationDate = async (fileUrl) => {
    const response = await axios.get('/api/readPdf', { params: { fileUrl } });
    const fileContent = response.data.text;

    // console.log ("response :", response.data);

    
    const date = convertTextualDateToDate(fileContent);
    return date;
}

export default findIncorporationDate;