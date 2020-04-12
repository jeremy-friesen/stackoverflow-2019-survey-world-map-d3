import csv
import json

def findYearCategory(n):
    if(n == "NA" or n == "YearsCode" or n == "YearsCodePro"):
        return "NA"
    if(n == "Less than 1 year"):
        return "Less than 5 years"
    if(n == "More than 50 years"):
        return "50 years or more"
    n = int(n)

    if(n < 5):
        return "Less than 5 years"
    elif(n <= 9):
        return "5 to 9 years"
    elif(n <= 14):
        return "10 to 14 years"
    elif(n <= 19):
        return "15 to 19 years"
    elif(n <= 24):
        return "20 to 24 years"
    elif(n <= 29):
        return "25 to 29 years"
    elif(n <= 34):
        return "30 to 34 years"
    elif(n <= 39):
        return "35 to 39 years"
    elif(n <= 44):
        return "40 to 44 years"
    elif(n <= 49):
        return "45 to 49 years"
    elif(n >= 50):
        return "50 years or more"


countries = {}

with open('../survey_results_public.csv', newline='') as csvfile:
    read = csv.reader(csvfile, delimiter=',')

    for row in read:
        country = row[6]
        languages = row[43].split(';')
        platforms = row[48].split(';')
        genders = row[78].split(';')
        developerTypes = row[12].split(';')
        student = row[7]
        yearsCoding = findYearCategory(row[13])
        yearsCodingPro = findYearCategory(row[15])
        competence = row[37]

        if not country in countries:
            countries[row[6]] = {
                'languages':[], 
                'platforms':[], 
                'genders':[], 
                'developerTypes':[], 
                'student':[],
                'yearsCoding':[],
                'yearsCodingPro':[],
                'competence':[]
            }

        for lang in languages:
            if lang in [i[0] for i in countries[country]['languages']]:
                [i for i in countries[country]['languages'] if i[0] == lang][0][1] += 1
            else:
                countries[country]['languages'].append([lang, 1])

        for platform in platforms:
            if platform in [i[0] for i in countries[country]['platforms']]:
                [i for i in countries[country]['platforms'] if i[0] == platform][0][1] += 1
            else:
                countries[country]['platforms'].append([platform, 1])

        for gender in genders:
            if gender in [i[0] for i in countries[country]['genders']]:
                [i for i in countries[country]['genders'] if i[0] == gender][0][1] += 1
            else:
                countries[country]['genders'].append([gender, 1])

        for devTypes in developerTypes:
            if devTypes in [i[0] for i in countries[country]['developerTypes']]:
                [i for i in countries[country]['developerTypes'] if i[0] == devTypes][0][1] += 1
            else:
                countries[country]['developerTypes'].append([devTypes, 1])

        if student in [i[0] for i in countries[country]['student']]:
            [i for i in countries[country]['student'] if i[0] == student][0][1] += 1
        else:
            countries[country]['student'].append([student, 1])

        if yearsCoding in [i[0] for i in countries[country]['yearsCoding']]:
            [i for i in countries[country]['yearsCoding'] if i[0] == yearsCoding][0][1] += 1
        else:
            countries[country]['yearsCoding'].append([yearsCoding, 1])

        if yearsCodingPro in [i[0] for i in countries[country]['yearsCodingPro']]:
            [i for i in countries[country]['yearsCodingPro'] if i[0] == yearsCodingPro][0][1] += 1
        else:
            countries[country]['yearsCodingPro'].append([yearsCodingPro, 1])
        
        if competence in [i[0] for i in countries[country]['competence']]:
            [i for i in countries[country]['competence'] if i[0] == competence][0][1] += 1
        else:
            countries[country]['competence'].append([competence, 1])


for country in countries:
    # sort languages by most used
    countries[country]['languages'] = sorted(countries[country]['languages'], key=lambda i: i[1], reverse=True)
    # change languages from lists to dictionary
    countries[country]['languages'] = {i[0]:i[1] for i in countries[country]['languages']}

    # sort platforms by most used
    countries[country]['platforms'] = sorted(countries[country]['platforms'], key=lambda i: i[1], reverse=True)
    # change platforms from lists to dictionary
    countries[country]['platforms'] = {i[0]:i[1] for i in countries[country]['platforms']}

    # sort gender by most common
    countries[country]['genders'] = sorted(countries[country]['genders'], key=lambda i: i[1], reverse=True)
    # change gender from lists to dictionary
    countries[country]['genders'] = {i[0]:i[1] for i in countries[country]['genders']}

    # sort developer type by most common
    countries[country]['developerTypes'] = sorted(countries[country]['developerTypes'], key=lambda i: i[1], reverse=True)
    # change developer types from lists to dictionary
    countries[country]['developerTypes'] = {i[0]:i[1] for i in countries[country]['developerTypes']}

    # sort student status by most common
    countries[country]['student'] = sorted(countries[country]['student'], key=lambda i: i[1], reverse=True)
    # change student status from lists to dictionary
    countries[country]['student'] = {i[0]:i[1] for i in countries[country]['student']}

    # sort yearsCoding by most common
    countries[country]['yearsCoding'] = sorted(countries[country]['yearsCoding'], key=lambda i: i[1], reverse=True)
    # change yearsCoding from lists to dictionary
    countries[country]['yearsCoding'] = {i[0]:i[1] for i in countries[country]['yearsCoding']}

    # sort yearsCodingPro by most common
    countries[country]['yearsCodingPro'] = sorted(countries[country]['yearsCodingPro'], key=lambda i: i[1], reverse=True)
    # change yearsCodingPro from lists to dictionary
    countries[country]['yearsCodingPro'] = {i[0]:i[1] for i in countries[country]['yearsCodingPro']}

    # sort competence  by most common
    countries[country]['competence'] = sorted(countries[country]['competence'], key=lambda i: i[1], reverse=True)
    # change competence from lists to dictionary
    countries[country]['competence'] = {i[0]:i[1] for i in countries[country]['competence']}

#jsonContent = json.dumps(countries)

with open('data.json', 'w') as outfile:
    json.dump(countries, outfile)