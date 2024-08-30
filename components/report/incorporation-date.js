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
        "TWENTY-FIRST": 21, "TWENTY FIRST": 21,
        "TWENTY-SECOND": 22, "TWENTY SECOND": 22,
        "TWENTY-THIRD": 23, "TWENTY THIRD": 23,
        "TWENTY-FOURTH": 24, "TWENTY FOURTH": 24,
        "TWENTY-FIFTH": 25, "TWENTY FIFTH": 25,
        "TWENTY-SIXTH": 26, "TWENTY SIXTH": 26,
        "TWENTY-SEVENTH": 27, "TWENTY SEVENTH": 27,
        "TWENTY-EIGHTH": 28, "TWENTY EIGHTH": 28,
        "TWENTY-NINTH": 29, "TWENTY NINTH": 29,
        "THIRTIETH": 30,
        "THIRTY-FIRST": 31, "THIRTY FIRST": 31
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

    // Adjusted regex patterns to ensure full word matching and variations
    const dayPattern = new RegExp("\\b(" + Object.keys(dayMap).join("|") + ")\\b", "i");
    const monthPattern = new RegExp("\\b(" + Object.keys(monthMap).join("|") + ")\\b", "i");
    const yearPattern = /\b(TWO THOUSAND(?: AND)?(?: \w+)?(?: \w+)?|TWENTY[- ]?\w+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|ELEVEN|TWELVE|THIRTEEN|FOURTEEN|FIFTEEN|SIXTEEN|SEVENTEEN|EIGHTEEN|NINETEEN|TWENTY[- ]ONE|TWENTY[- ]TWO|TWENTY[- ]THREE|TWENTY[- ]FOUR|TWENTY[- ]FIVE|TWENTY[- ]SIX|TWENTY[- ]SEVEN|TWENTY[- ]EIGHT|TWENTY[- ]NINE|TWENTY[- ]TEN|TWENTY[- ]ELEVEN|TWENTY[- ]TWELVE|TWENTY[- ]THIRTEEN|TWENTY[- ]FOURTEEN|TWENTY[- ]FIFTEEN|TWENTY[- ]SIXTEEN|TWENTY[- ]SEVENTEEN|TWENTY[- ]EIGHTEEN|TWENTY[- ]NINETEEN)\b/i;

    const dayMatch = text.match(dayPattern);
    const monthMatch = text.match(monthPattern);
    const yearMatch = text.match(yearPattern);

    if (dayMatch && monthMatch && yearMatch) {
        const day = dayMap[dayMatch[0].toUpperCase()];
        const month = monthMap[monthMatch[0].toUpperCase()];

        const yearText = yearMatch[0].toUpperCase();
        let year = 2000;  // Initialize the year variable

        console.log("Year text extracted:", yearText);

        // Handle various year formats
        if (yearText.startsWith("TWO THOUSAND")) {
            const yearParts = yearText.split(" ");
            console.log("Year parts:", yearParts);

            if (yearParts.includes("TWENTY") || yearParts.includes("TWENTY-ONE") || yearParts.includes("TWENTY ONE")) {
                year += 20;
            }

            const lastPart = yearParts[yearParts.length - 1];
            console.log("Last part of year:", lastPart);

            const numberMapping = {
                "ONE": 1,
                "TWO": 2,
                "THREE": 3,
                "FOUR": 4,
                "FIVE": 5,
                "SIX": 6,
                "SEVEN": 7,
                "EIGHT": 8,
                "NINE": 9,
                "TEN": 10,
                "ELEVEN": 11,
                "TWELVE": 12,
                "THIRTEEN": 13,
                "FOURTEEN": 14,
                "FIFTEEN": 15,
                "SIXTEEN": 16,
                "SEVENTEEN": 17,
                "EIGHTEEN": 18,
                "NINETEEN": 19,
                "TWENTY": 20,
                "TWENTY-ONE": 21,
                "TWENTY-TWO": 22,
                "TWENTY-THREE": 23,
                "TWENTY-FOUR": 24
            };

            if (lastPart in numberMapping) {
                year += numberMapping[lastPart];
            }
        } else if (yearText.startsWith("TWENTY") || yearText.includes("-")) {
            year = 2000 + parseInt(yearText.replace("TWENTY", "").replace("-", "").trim(), 10);
        } else if (yearText.match(/\b(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE)\b/i)) {
            year = 2000 + numberMapping[yearText.toUpperCase()];
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