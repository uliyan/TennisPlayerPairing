input = process.argv.slice(2);

/**
 * This function checks whether the input is valid or not by making sure only letters are present 
 * in the input as well as only 2 strings were input.
 * @param {string[]} input is what the user enters when running the script
 */
function checkInput(input){
    if(input.length == 2){
        if ((/^[a-zA-Z]+$/.test(input[0])) && (/^[a-zA-Z]+$/.test(input[1])) && (input[0] !== undefined && input[1] !== undefined)){
            //Correct input-2 strings each only containing letters
            return true;
        }            
        else{
            //Incorrect input-2 strings are invalid, should only contain letters
            return false;
        }
            
    }else{
        //Incorrect input-NOT 2 strings
        return false;
    }
}

/**
 * Calculates how well two people match using their names within a string.
 * @param {string[]} input An array with 2 names
 * @returns a string to communicate how well the inputs match
 */
function checkMatch(input){
    //Constructing string to process
    str = input[0] + " matches " + input[1];
    str = str.toUpperCase();
    //console.log("str: " + str);

    //Contains characters checked in variable 'str'
    charChecked = []; 
    matchNum = "";

    //Reading from left to right counting how many times a character has appreared in 'str'
    for (let i = 0; i < str.length; i++) {
        character = str.charAt(i);
        //console.log("character: " + character);
        if((!charChecked.includes(character)) && character != ' '){
            num = str.split(character).length-1;
            matchNum += num;
            charChecked.push(character);
            //console.log("charChecked: " + charChecked);
            //console.log("num: " + num);
        }else{
            continue;
        }       
    }

    //Reducing 'matchNum' to a 2-digit number
    percentage = "";
    while(matchNum.length >= 1){
        if(matchNum.length == 1){
            percentage += matchNum;
            matchNum = percentage;
            percentage = "";

            //Checking if reducing is complete, that being if 'matchNum' at this point is 2 digits
            if(matchNum.length == 2){
                percentage = matchNum;
                break;
            }
            continue;
        }

        //Adding the numbers on the left and right-hand sides of the 'matchNum' string
        lhs = parseInt(""+matchNum.charAt(0));
        rhs = parseInt(""+matchNum.charAt(matchNum.length-1));
        sum = lhs + rhs;

        //Adding sum to percentage and removing the left and right-hand sides of the 'matchNum' string
        percentage += sum;
        matchNum = matchNum.substring(1, matchNum.length-1);

        // console.log("----------------------------------");        
        // console.log("sum: " + sum);
        // console.log("percentage: " + percentage);
        // console.log("matchNum: " + matchNum + ", length: " + matchNum.length);

        if(matchNum.length == 0){
            matchNum = percentage;
            percentage = "";
        }
    }

    //Showing user match results
    matchRes = input[0] + " matches " + input[1] + " " + percentage + "%";
    if(parseInt(percentage) > 80){
        return [matchRes + ", goodmatch", parseInt(percentage)];
    }else{
        return [matchRes, parseInt(percentage)];
    }
}

/**
 * Function calculates how well two players names match wwhen used within a sentence 
 * and returns a percentage.
 * @param {string} name1 
 * @param {string} name2 
 */
function checkNames(name1, name2){
    input = [name1, name2];
    inputValidity = checkInput(input);

    if(inputValidity == true){
        result = checkMatch(input);
        return result;
    }else{
        return "Input incorrect";
    }
}

/**
 * Reading the csv file line by line separating players by their gender and 
 * proceed to calculate how well players in one set match with each player of the opposite set.
 * These results are sorted numerically first before sorting alphabetically (where match percentages are equal).
 * This is done given the file path input exists and no file related issues exist.
 * @param {string} filePath path of the csv file to be processed.
 */
function processFile(filePath){
    //Importing file system 
    const fs = require('fs');
 
    try {
        if (fs.existsSync(filePath)) {
            //File exists and importing csv parser to read from it
            const csv = require('csv-parser');

            //Reading file from path input and separating players by their gender
            males = [];
            females =[];
            fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                //Assigning player to group based on gender
                if(row["gender"] === "m" && !males.includes(row["Name"])){
                    males.push(row["Name"]);
                }else if(row["gender"] === "f" && !females.includes(row["Name"])){
                    females.push(row["Name"]);
                }else{}
            })
            .on('error', () => {
                // Handling error
                console.log("Oops! Something happened. Check the input file in case anything is wrong")
            })
            .on('end', ()=> {
                //Now that players are separated each will be matched with a player in the other set
                results = [];
                for (let i = 0; i < males.length; i++){
                    for (let j = 0; j < females.length; j++){
                        result = checkNames(males[i], females[j]);
                        results.push(result);
                    }
                }

                //Sorting results by percentages descending, done using bubblesort
                for (let i = 0; i < results.length; i++) {
                    for (let j = 0; j < ( results.length - i -1 ); j++) {
                        n = results[j];
                        perc1 = n[1];

                        m = results[j+1];
                        perc2 = m[1];

                        if (perc1 < perc2) {
                            let temp = results[j];
                            results[j] = results[j + 1];
                            results[j + 1] = temp;
                        }
                    }
                }

                //Sorting results alphabetically where match percentages are equal.
                for (let i = 0; i < results.length; i++) {
                    count = getOccurrence(results, results[i][1]);
                    //checking if the current percentage appears more than once in teh array
                    if(count > 1){  
                        //Cutting out slice of array containing the same percentage  and sorting it alphabetically                  
                        arraySlice = results.slice(i, i+count);
                        arraySlice.sort();

                        //Updating results with sorted 'arraySlice' variable
                        for(let j = 0; j < count; j++){
                            results[i + j] = arraySlice[j];
                        }

                        //Skipping the next array elements(whcih we already sorted alphabetically)
                        i += count-1;
                    }
                }
                
                //Constructing output path
                outputPath = filePath;
                outputPath = outputPath.split("/");
                outPath = "";
                for (let i = 0; i < outputPath.length-1; i++){
                    outPath += outputPath[i] + "/";
                }
                outPath += "output.txt";

                //Writing results to file
                var file = fs.createWriteStream(outPath);
                file.on('error', function(err) { console.log(err); });
                results.forEach(function(v) { file.write(v[0] + '\n'); });
                file.end();
            });
        }
    } catch(err) {
        console.error(err);
        return err;
    }
}

/**
 * Checks how many times a number appears in the second column of the 2-D array
 * @param {[][]} array 
 * @param {number} value 
 * @returns 
 */
function getOccurrence(array, value) {
    var count = 0;
    array.forEach((v) => (v[1] === value && count++));
    return count;
}

//Exporting functions
exports.checkNames = checkNames;
exports.processFile = processFile;