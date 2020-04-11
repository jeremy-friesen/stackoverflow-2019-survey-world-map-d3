import csv
import json

countries = {}

with open('../survey_results_public.csv', newline='') as csvfile:
    read = csv.reader(csvfile, delimiter=',')

    for row in read:
        country = row[6]
        languages = row[43].split(';')

        if not row[6] in countries:
            countries[row[6]] = {'languages':[]}

        for lang in languages:
            if lang in [i[0] for i in countries[country]['languages']]:
                [i for i in countries[country]['languages'] if i[0] == lang][0][1] += 1
            else:
                countries[country]['languages'].append([lang, 1])

# sort languages by most used
for country in countries:
    countries[country]['languages'] = sorted(countries[country]['languages'], key=lambda i: i[1], reverse=True)
    countries[country]['languages'] = {lang[0]:lang[1] for lang in countries[country]['languages']}

#jsonContent = json.dumps(countries)

with open('data.json', 'w') as outfile:
    json.dump(countries, outfile)