/**
 * US Cities to State Mapping Database
 * This comprehensive database maps US city names to their states
 * Used for ensuring all US cities display with proper state information
 */

// State abbreviations mapping
export const US_STATES = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'District of Columbia': 'DC'
};

// Reverse mapping for state abbreviations to full names
export const STATE_ABBREVIATIONS = Object.entries(US_STATES).reduce((acc, [fullName, abbrev]) => {
  acc[abbrev] = fullName;
  return acc;
}, {});

/**
 * Comprehensive US cities database with state information
 * Organized by state for efficient lookup
 * Includes major cities, smaller towns, and common search terms
 */
export const US_CITIES_BY_STATE = {
  'AL': [
    'Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Hoover', 'Dothan', 
    'Auburn', 'Decatur', 'Madison', 'Florence', 'Gadsden', 'Vestavia Hills', 'Prattville',
    'Phenix City', 'Alabaster', 'Bessemer', 'Enterprise', 'Opelika', 'Homewood'
  ],
  'AK': [
    'Anchorage', 'Fairbanks', 'Juneau', 'Wasilla', 'Sitka', 'Ketchikan', 'Kenai', 
    'Kodiak', 'Bethel', 'Palmer', 'Homer', 'Barrow', 'Unalaska', 'Haines', 'Seward'
  ],
  'AZ': [
    'Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 
    'Tempe', 'Peoria', 'Surprise', 'Yuma', 'Avondale', 'Flagstaff', 'Goodyear',
    'Lake Havasu City', 'Buckeye', 'Casa Grande', 'Sierra Vista', 'Maricopa', 'Oro Valley'
  ],
  'AR': [
    'Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'North Little Rock',
    'Conway', 'Rogers', 'Pine Bluff', 'Bentonville', 'Hot Springs', 'Benton', 'Texarkana',
    'Sherwood', 'Jacksonville', 'Russellville', 'Bella Vista', 'Paragould', 'Cabot', 'Searcy'
  ],
  'CA': [
    'Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 
    'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 
    'Stockton', 'Irvine', 'Chula Vista', 'Fremont', 'San Bernardino', 'Modesto', 
    'Fontana', 'Oxnard', 'Moreno Valley', 'Huntington Beach', 'Glendale', 'Santa Clarita',
    'Garden Grove', 'Oceanside', 'Rancho Cucamonga', 'Santa Rosa', 'Ontario', 'Lancaster',
    'Elk Grove', 'Corona', 'Palmdale', 'Salinas', 'Pomona', 'Hayward', 'Escondido',
    'Torrance', 'Sunnyvale', 'Orange', 'Fullerton', 'Pasadena', 'Thousand Oaks',
    'Visalia', 'Simi Valley', 'Concord', 'Roseville', 'Rockville', 'Santa Clara',
    'Victorville', 'Vallejo', 'Berkeley', 'El Monte', 'Downey', 'Costa Mesa', 'Inglewood',
    'Ojai', 'Carmel', 'Sausalito', 'Tiburon', 'Half Moon Bay', 'Capitola', 'Mendocino',
    'Ferndale', 'Nevada City', 'Grass Valley', 'Auburn', 'Placerville', 'Angels Camp',
    'Sonora', 'Mammoth Lakes', 'Bishop', 'Lone Pine', 'Truckee', 'South Lake Tahoe'
  ],
  'CO': [
    'Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton',
    'Arvada', 'Westminster', 'Pueblo', 'Centennial', 'Boulder', 'Greeley', 'Longmont',
    'Loveland', 'Grand Junction', 'Broomfield', 'Castle Rock', 'Commerce City', 'Parker',
    'Littleton', 'Northglenn', 'Brighton', 'Englewood', 'Wheat Ridge', 'Lafayette'
  ],
  'CT': [
    'Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury',
    'New Britain', 'West Hartford', 'Greenwich', 'Hamden', 'Meriden', 'Bristol', 'Milford',
    'New London', 'West Haven', 'Middletown', 'Norwich', 'Shelton', 'Torrington'
  ],
  'DE': [
    'Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna', 'Milford', 'Seaford',
    'Georgetown', 'Elsmere', 'New Castle', 'Bear', 'Pike Creek', 'Brookside', 'Hockessin',
    'Rehoboth Beach', 'Bethany Beach', 'Lewes', 'Fenwick Island', 'Dewey Beach', 'Bethel',
    'Bridgeville', 'Camden', 'Cheswold', 'Clayton', 'Dagsboro', 'Delmar', 'Felton',
    'Frankford', 'Frederica', 'Harrington', 'Laurel', 'Millsboro', 'Milton', 'Ocean View'
  ],
  'FL': [
    'Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee',
    'Fort Lauderdale', 'Port St. Lucie', 'Cape Coral', 'Pembroke Pines', 'Hollywood',
    'Miramar', 'Gainesville', 'Coral Springs', 'Miami Gardens', 'Clearwater', 'Palm Bay',
    'West Palm Beach', 'Pompano Beach', 'Lakeland', 'Davie', 'Miami Beach', 'Sunrise',
    'Boca Raton', 'Deltona', 'Plantation', 'Alafaya', 'Palm Coast', 'Largo', 'Melbourne',
    'Boynton Beach', 'Fort Myers', 'Kissimmee', 'Homestead', 'Tamarac', 'Delray Beach',
    'Daytona Beach', 'North Miami', 'Wellington', 'North Port', 'Coconut Creek', 'Sanford',
    'Sarasota', 'Pensacola', 'Margate', 'Lauderhill', 'Lake Worth', 'Naples'
  ],
  'GA': [
    'Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens', 'Sandy Springs',
    'Roswell', 'Johns Creek', 'Albany', 'Warner Robins', 'Alpharetta', 'Marietta',
    'Valdosta', 'Smyrna', 'Dunwoody', 'Rome', 'East Point', 'Peachtree Corners',
    'Gainesville', 'Hinesville', 'Kennesaw', 'Lawrenceville', 'Douglasville', 'Mableton'
  ],
  'HI': [
    'Honolulu', 'East Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Waipahu', 'Kaneohe',
    'Mililani Town', 'Kahului', 'Ewa Gentry', 'Mililani Mauka', 'Ewa Beach', 'Wahiawa',
    'Schofield Barracks', 'Halawa', 'Aiea', 'Hawaiian Paradise Park', 'Waimalu', 'Kihei'
  ],
  'ID': [
    'Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello', 'Caldwell', 'Coeur d\'Alene',
    'Twin Falls', 'Lewiston', 'Post Falls', 'Rexburg', 'Moscow', 'Eagle', 'Kuna',
    'Ammon', 'Chubbuck', 'Hayden', 'Mountain Home', 'Burley', 'Jerome'
  ],
  'IL': [
    'Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria',
    'Elgin', 'Waukegan', 'Cicero', 'Champaign', 'Bloomington', 'Arlington Heights',
    'Evanston', 'Decatur', 'Schaumburg', 'Bolingbrook', 'Palatine', 'Skokie',
    'Des Plaines', 'Orland Park', 'Tinley Park', 'Oak Lawn', 'Berwyn', 'Mount Prospect',
    'Normal', 'Wheaton', 'Hoffman Estates', 'Oak Park', 'Downers Grove', 'Elmhurst',
    'Glenview', 'DeKalb', 'Lombard', 'Belleville', 'Moline', 'Buffalo Grove', 'Bartlett',
    'Urbana', 'Quincy', 'Crystal Lake', 'Plainfield', 'Streamwood', 'Carol Stream',
    'Romeoville', 'Rock Island', 'Park Ridge', 'Addison', 'Calumet City'
  ],
  'IN': [
    'Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers',
    'Bloomington', 'Hammond', 'Gary', 'Muncie', 'Lafayette', 'Terre Haute', 'Kokomo',
    'Anderson', 'Noblesville', 'Greenwood', 'Elkhart', 'Mishawaka', 'Lawrence',
    'Jeffersonville', 'Columbus', 'Portage', 'New Albany', 'Richmond', 'Westfield'
  ],
  'IA': [
    'Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Waterloo', 'Iowa City',
    'Council Bluffs', 'Ames', 'West Des Moines', 'Dubuque', 'Ankeny', 'Urbandale',
    'Cedar Falls', 'Marion', 'Bettendorf', 'Mason City', 'Marshalltown', 'Clinton',
    'Burlington', 'Ottumwa', 'Fort Dodge', 'Coralville', 'Johnston', 'Muscatine'
  ],
  'KS': [
    'Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka', 'Lawrence', 'Shawnee',
    'Manhattan', 'Lenexa', 'Salina', 'Hutchinson', 'Leavenworth', 'Leawood', 'Dodge City',
    'Garden City', 'Emporia', 'Junction City', 'Derby', 'Prairie Village', 'Hays'
  ],
  'KY': [
    'Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Richmond',
    'Georgetown', 'Florence', 'Hopkinsville', 'Nicholasville', 'Elizabethtown',
    'Henderson', 'Frankfort', 'Jeffersontown', 'Independence', 'Paducah', 'Radcliff',
    'Ashland', 'Murray', 'St. Matthews'
  ],
  'LA': [
    'New Orleans', 'Baton Rouge', 'Shreveport', 'Metairie', 'Lafayette', 'Lake Charles',
    'Kenner', 'Bossier City', 'Monroe', 'Alexandria', 'Houma', 'Marrero', 'Bayou Cane',
    'Prairieville', 'Central', 'Laplace', 'Slidell', 'Ruston', 'Hammond', 'Sulphur'
  ],
  'ME': [
    'Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford', 'Sanford',
    'Saco', 'Augusta', 'Westbrook', 'Waterville', 'Presque Isle', 'Orono', 'York',
    'Windham', 'Gorham', 'Brunswick', 'Scarborough', 'Kennebunk', 'Old Town'
  ],
  'MD': [
    'Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Hagerstown',
    'Annapolis', 'College Park', 'Salisbury', 'Laurel', 'Greenbelt', 'Cumberland',
    'Westminster', 'Hyattsville', 'Takoma Park', 'Easton', 'Elkton', 'Aberdeen',
    'Havre de Grace', 'Cambridge', 'La Plata', 'Ocean City', 'Severn', 'Glen Burnie'
  ],
  'MA': [
    'Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford', 'Brockton',
    'Quincy', 'Lynn', 'Fall River', 'Newton', 'Lawrence', 'Somerville', 'Framingham',
    'Haverhill', 'Waltham', 'Malden', 'Brookline', 'Plymouth', 'Medford', 'Taunton',
    'Chicopee', 'Weymouth', 'Revere', 'Peabody', 'Methuen', 'Barnstable', 'Pittsfield',
    'Attleboro', 'Everett', 'Salem', 'Westfield', 'Leominster', 'Fitchburg', 'Beverly',
    'Holyoke', 'Marlborough', 'Woburn', 'Amherst', 'Chelsea', 'Braintree', 'Dartmouth',
    'Concord', 'Lexington', 'Nantucket', 'Provincetown', 'Chatham', 'Orleans', 'Wellfleet',
    'Truro', 'Eastham', 'Dennis', 'Yarmouth', 'Harwich', 'Brewster', 'Sandwich'
  ],
  'MI': [
    'Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing', 'Ann Arbor',
    'Flint', 'Dearborn', 'Livonia', 'Westland', 'Troy', 'Farmington Hills', 'Kalamazoo',
    'Wyoming', 'Southfield', 'Rochester Hills', 'Taylor', 'Pontiac', 'St. Clair Shores',
    'Royal Oak', 'Novi', 'Dearborn Heights', 'Battle Creek', 'Saginaw', 'Kentwood',
    'East Lansing', 'Roseville', 'Portage', 'Midland', 'Lincoln Park', 'Bay City',
    'Madison Heights', 'Muskegon', 'Ferndale', 'Jackson', 'Wyandotte', 'Eastpointe'
  ],
  'MN': [
    'Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park',
    'Plymouth', 'St. Cloud', 'Eagan', 'Woodbury', 'Maple Grove', 'Eden Prairie',
    'Coon Rapids', 'Burnsville', 'Minnetonka', 'Blaine', 'Lakeville', 'Edina',
    'Brooklyn Center', 'Moorhead', 'Mankato', 'Winona', 'Apple Valley', 'Richfield',
    'Roseville', 'Inver Grove Heights', 'Cottage Grove', 'Fridley', 'Shakopee', 'Owatonna'
  ],
  'MS': [
    'Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Meridian', 'Tupelo',
    'Greenville', 'Olive Branch', 'Horn Lake', 'Clinton', 'Pearl', 'Ridgeland',
    'Columbus', 'Madison', 'Vicksburg', 'Pascagoula', 'Brandon', 'Oxford', 'Laurel'
  ],
  'MO': [
    'Kansas City', 'St. Louis', 'Springfield', 'Independence', 'Columbia', 'Lee\'s Summit',
    'O\'Fallon', 'St. Joseph', 'St. Charles', 'St. Peters', 'Blue Springs', 'Florissant',
    'Joplin', 'Chesterfield', 'Jefferson City', 'Cape Girardeau', 'Oakville', 'Ballwin',
    'Raytown', 'Liberty', 'Wentzville', 'Wildwood', 'University City', 'Sedalia',
    'Kirkwood', 'Maryland Heights', 'Hazelwood', 'Gladstone', 'Grandview', 'Belton'
  ],
  'MT': [
    'Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte', 'Helena', 'Kalispell',
    'Havre', 'Anaconda', 'Miles City', 'Belgrade', 'Livingston', 'Laurel', 'Whitefish',
    'Sidney', 'Lewistown', 'Glendive', 'Hamilton', 'Columbia Falls', 'Polson',
    'Red Lodge', 'Big Sky', 'Ennis', 'Dillon', 'Deer Lodge', 'Choteau', 'Cut Bank',
    'Shelby', 'Chester', 'Chinook', 'Malta', 'Glasgow', 'Wolf Point', 'Plentywood',
    'Scobey', 'Libby', 'Troy', 'Eureka', 'Bigfork', 'Seeley Lake'
  ],
  'NE': [
    'Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings',
    'North Platte', 'Norfolk', 'Columbus', 'Papillion', 'La Vista', 'Scottsbluff',
    'South Sioux City', 'Beatrice', 'Chalco', 'Lexington', 'Gering', 'Alliance', 'York'
  ],
  'NV': [
    'Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City',
    'Fernley', 'Elko', 'Mesquite', 'Boulder City', 'Fallon', 'Winnemucca', 'West Wendover',
    'Ely', 'Yerington', 'Carlin', 'Lovelock', 'Wells', 'Caliente', 'Hawthorne'
  ],
  'NH': [
    'Manchester', 'Nashua', 'Concord', 'Derry', 'Dover', 'Rochester', 'Salem', 'Merrimack',
    'Hudson', 'Londonderry', 'Keene', 'Bedford', 'Portsmouth', 'Goffstown', 'Laconia',
    'Hampton', 'Milford', 'Durham', 'Exeter', 'Windham', 'Claremont', 'Lebanon',
    'Hanover', 'Conway', 'Berlin', 'Somersworth', 'Franklin', 'Littleton', 'Newport',
    'Plymouth', 'Wolfeboro', 'Peterborough', 'Jaffrey', 'New London', 'Sunapee',
    'North Conway', 'Jackson', 'Bretton Woods', 'Lincoln', 'Franconia', 'Sugar Hill'
  ],
  'NJ': [
    'Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood',
    'Toms River', 'Hamilton', 'Trenton', 'Clifton', 'Camden', 'Brick', 'Cherry Hill',
    'Passaic', 'Union City', 'Middletown', 'Gloucester', 'East Orange', 'Bayonne',
    'Vineland', 'New Brunswick', 'Hoboken', 'Perth Amboy', 'West New York', 'Plainfield',
    'Hackensack', 'Sayreville', 'Kearny', 'Linden', 'Atlantic City', 'Fort Lee',
    'Fair Lawn', 'Garfield', 'Paramus', 'Wayne', 'West Orange', 'Irvington', 'Parsippany'
  ],
  'NM': [
    'Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington',
    'Clovis', 'Hobbs', 'Alamogordo', 'Carlsbad', 'Gallup', 'Deming', 'Los Alamos',
    'Chaparral', 'Sunland Park', 'Las Vegas', 'Portales', 'North Valley', 'Silver City',
    'Artesia', 'Lovington', 'Anthony', 'Grants', 'Española', 'Bernalillo'
  ],
  'NY': [
    'New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle',
    'Mount Vernon', 'Schenectady', 'Utica', 'White Plains', 'Hempstead', 'Troy',
    'Niagara Falls', 'Binghamton', 'Freeport', 'Valley Stream', 'Long Beach', 'Rome',
    'Watertown', 'Ithaca', 'West Seneca', 'North Tonawanda', 'Jamestown', 'Elmira',
    'Kingston', 'Middletown', 'Newburgh', 'Poughkeepsie', 'Saratoga Springs', 'Spring Valley',
    'Glen Cove', 'Cohoes', 'Oswego', 'Cortland', 'Oneonta', 'Plattsburgh', 'Fulton',
    'Glens Falls', 'Johnson City', 'Amsterdam', 'Peekskill', 'Lackawanna', 'Batavia'
  ],
  'NC': [
    'Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville',
    'Cary', 'Wilmington', 'High Point', 'Greenville', 'Asheville', 'Concord', 'Gastonia',
    'Jacksonville', 'Chapel Hill', 'Rocky Mount', 'Burlington', 'Wilson', 'Huntersville',
    'Kannapolis', 'Apex', 'Hickory', 'Goldsboro', 'Indian Trail', 'Monroe', 'Salisbury',
    'Thomasville', 'Cornelius', 'Mint Hill', 'Sanford', 'Mooresville', 'New Bern',
    'Cleveland', 'Statesville', 'Lumberton', 'Carrboro', 'Morrisville', 'Shelby'
  ],
  'ND': [
    'Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson',
    'Mandan', 'Jamestown', 'Wahpeton', 'Devils Lake', 'Valley City', 'Grafton',
    'Watford City', 'Rugby', 'Beulah', 'Horace', 'Casselton', 'New Town', 'Bottineau'
  ],
  'OH': [
    'Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton',
    'Youngstown', 'Lorain', 'Hamilton', 'Springfield', 'Kettering', 'Elyria', 'Lakewood',
    'Cuyahoga Falls', 'Middletown', 'Euclid', 'Newark', 'Mansfield', 'Mentor', 'Beavercreek',
    'Cleveland Heights', 'Strongsville', 'Fairborn', 'Dublin', 'Warren', 'Findlay',
    'Lancaster', 'Lima', 'Huber Heights', 'Westerville', 'Marion', 'Grove City', 'Stow',
    'Delaware', 'Brunswick', 'Upper Arlington', 'Reynoldsburg', 'Westlake', 'Chillicothe',
    'Gahanna', 'Massillon', 'North Olmsted', 'Pickerington', 'Zanesville', 'Boardman'
  ],
  'OK': [
    'Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton', 'Edmond', 'Moore',
    'Midwest City', 'Enid', 'Stillwater', 'Muskogee', 'Bartlesville', 'Owasso', 'Shawnee',
    'Ponca City', 'Ardmore', 'Duncan', 'Bixby', 'McAlester', 'Durant', 'Tahlequah',
    'El Reno', 'Jenks', 'Bethany', 'Mustang', 'Sand Springs', 'Sapulpa', 'Yukon',
    'Ada', 'Claremore', 'Altus', 'Guthrie', 'Chickasha', 'Miami', 'Woodward'
  ],
  'OR': [
    'Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro', 'Bend', 'Beaverton', 'Medford',
    'Springfield', 'Corvallis', 'Albany', 'Tigard', 'Lake Oswego', 'Keizer', 'Grants Pass',
    'Oregon City', 'McMinnville', 'Redmond', 'Tualatin', 'West Linn', 'Woodburn',
    'Forest Grove', 'Newberg', 'Roseburg', 'Klamath Falls', 'Ashland', 'Milwaukie',
    'Happy Valley', 'Central Point', 'Canby', 'Hermiston', 'Pendleton', 'Dallas'
  ],
  'PA': [
    'Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem',
    'Lancaster', 'Harrisburg', 'Altoona', 'York', 'State College', 'Wilkes-Barre',
    'Chester', 'Williamsport', 'Easton', 'Lebanon', 'Hazleton', 'New Castle', 'Johnstown',
    'Washington', 'West Chester', 'Butler', 'Hermitage', 'Greensburg', 'Norristown',
    'McKeesport', 'Pottstown', 'Chambersburg', 'Bloomsburg', 'Indiana', 'Drexel Hill',
    'Levittown', 'Franklin Park', 'King of Prussia', 'Monroeville', 'Radnor', 'Bethel Park'
  ],
  'RI': [
    'Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket',
    'Coventry', 'Cumberland', 'North Providence', 'South Kingstown', 'West Warwick',
    'Johnston', 'North Kingstown', 'Newport', 'Bristol', 'Smithfield', 'Central Falls',
    'Barrington', 'Portsmouth', 'Middletown', 'Tiverton', 'East Greenwich', 'Narragansett'
  ],
  'SC': [
    'Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville',
    'Summerville', 'Sumter', 'Hilton Head Island', 'Spartanburg', 'Florence', 'Goose Creek',
    'Aiken', 'Myrtle Beach', 'Anderson', 'Greer', 'Greenwood', 'Taylors', 'St. Andrews',
    'Easley', 'Socastee', 'Conway', 'Cayce', 'Lexington', 'Fort Mill', 'Port Royal'
  ],
  'SD': [
    'Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell',
    'Yankton', 'Pierre', 'Huron', 'Spearfish', 'Vermillion', 'Brandon', 'Box Elder',
    'Madison', 'Sturgis', 'Belle Fourche', 'Hot Springs', 'Lead', 'Deadwood', 'Winner'
  ],
  'TN': [
    'Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro',
    'Franklin', 'Jackson', 'Johnson City', 'Bartlett', 'Hendersonville', 'Kingsport',
    'Collierville', 'Smyrna', 'Cleveland', 'Brentwood', 'Germantown', 'Columbia',
    'Spring Hill', 'La Vergne', 'Gallatin', 'Cookeville', 'Mount Juliet', 'Lebanon',
    'Goodlettsville', 'Oak Ridge', 'Morristown', 'Shelbyville', 'Tullahoma', 'Maryville'
  ],
  'TX': [
    'Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington',
    'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Garland', 'Irving', 'Amarillo',
    'Grand Prairie', 'Brownsville', 'McKinney', 'Frisco', 'Pasadena', 'Killeen',
    'Carrollton', 'Mesquite', 'McAllen', 'Denton', 'Midland', 'Waco', 'Round Rock',
    'Richardson', 'Lewisville', 'Odessa', 'College Station', 'Pearland', 'Beaumont',
    'Abilene', 'Sugar Land', 'Wichita Falls', 'Tyler', 'The Woodlands', 'Baytown',
    'League City', 'Longview', 'Bryan', 'Pharr', 'Carrollton', 'Missouri City',
    'Temple', 'Flower Mound', 'Allen', 'Cedar Park', 'Mission', 'New Braunfels',
    'Conroe', 'Cedar Hill', 'Georgetown', 'North Richland Hills', 'Victoria', 'San Marcos',
    'Harlingen', 'Mansfield', 'Euless', 'Grapevine', 'Galveston', 'Port Arthur'
  ],
  'UT': [
    'Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy',
    'Ogden', 'St. George', 'Layton', 'Taylorsville', 'South Jordan', 'Lehi', 'Logan',
    'Murray', 'Draper', 'Bountiful', 'Riverton', 'Roy', 'Pleasant Grove', 'Tooele',
    'Spanish Fork', 'Springville', 'Cedar City', 'Herriman', 'Eagle Mountain', 'Payson',
    'Saratoga Springs', 'Kaysville', 'Cottonwood Heights', 'Midvale', 'Clearfield', 'Vernal'
  ],
  'VT': [
    'Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier', 'Winooski',
    'St. Albans', 'Newport', 'Vergennes', 'Brattleboro', 'Hartford', 'Colchester',
    'Essex', 'Bennington', 'Milton', 'Williston', 'Middlebury', 'St. Johnsbury', 'Swanton',
    'Stowe', 'Manchester', 'Woodstock', 'Killington', 'Warren', 'Waitsfield', 'Waterbury',
    'Ludlow', 'Chester', 'Grafton', 'Weston', 'Dorset', 'Arlington', 'Shaftsbury',
    'Wilmington', 'Townshend', 'Newfane', 'Putney', 'Bellows Falls', 'Windsor',
    'Plymouth', 'Conway'
  ],
  'VA': [
    'Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria',
    'Hampton', 'Portsmouth', 'Suffolk', 'Roanoke', 'Lynchburg', 'Harrisonburg',
    'Leesburg', 'Charlottesville', 'Danville', 'Blacksburg', 'Manassas', 'Petersburg',
    'Fredericksburg', 'Winchester', 'Salem', 'Staunton', 'Falls Church', 'Hopewell',
    'Bristol', 'Waynesboro', 'Colonial Heights', 'Franklin', 'Radford', 'Martinsville',
    'Herndon', 'Vienna', 'Fairfax', 'Poquoson', 'Williamsburg', 'Front Royal'
  ],
  'WA': [
    'Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton',
    'Yakima', 'Federal Way', 'Spokane Valley', 'Bellingham', 'Kennewick', 'Auburn',
    'Pasco', 'Marysville', 'Lakewood', 'Redmond', 'Shoreline', 'Richland', 'Kirkland',
    'Burien', 'Sammamish', 'Olympia', 'Lacey', 'Edmonds', 'Bremerton', 'Puyallup',
    'Bothell', 'Lynnwood', 'Longview', 'Issaquah', 'Wenatchee', 'Mount Vernon',
    'University Place', 'Walla Walla', 'Pullman', 'Des Moines', 'Lake Stevens', 'SeaTac'
  ],
  'WV': [
    'Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling', 'Martinsburg',
    'Fairmont', 'Beckley', 'Clarksburg', 'Lewisburg', 'Buckhannon', 'Charles Town',
    'Bridgeport', 'Hurricane', 'South Charleston', 'Teays Valley', 'Cross Lanes',
    'Nitro', 'St. Albans', 'Moundsville', 'Ranson', 'Elkins', 'Oak Hill', 'Keyser'
  ],
  'WI': [
    'Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha',
    'Eau Claire', 'Oshkosh', 'Janesville', 'West Allis', 'La Crosse', 'Sheboygan',
    'Wauwatosa', 'Fond du Lac', 'New Berlin', 'Wausau', 'Brookfield', 'Greenfield',
    'Beloit', 'Franklin', 'Oak Creek', 'Manitowoc', 'West Bend', 'Sun Prairie',
    'Superior', 'Stevens Point', 'Fitchburg', 'Hales Corners', 'Middleton', 'Neenah',
    'Mount Pleasant', 'Caledonia', 'Wisconsin Rapids', 'Cary', 'Onalaska', 'De Pere'
  ],
  'WY': [
    'Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan', 'Green River',
    'Evanston', 'Riverton', 'Jackson', 'Cody', 'Rawlins', 'Lander', 'Torrington',
    'Powell', 'Douglas', 'Worland', 'Buffalo', 'Wheatland', 'Newcastle', 'Thermopolis',
    'Opal', 'Wamsutter', 'Medicine Bow', 'Baggs', 'Meeteetse', 'Moorcroft', 'Sundance',
    'Hulett', 'Guernsey', 'Glenrock', 'Saratoga', 'Encampment', 'Dubois', 'Pinedale',
    'Afton', 'Teton Village', 'Wilson', 'Alta', 'Moran', 'Kelly'
  ],
  'DC': [
    'Washington'
  ]
};

/**
 * Create a reverse lookup map from city name to states
 * This handles cities that exist in multiple states
 */
export const CITY_TO_STATES_MAP = {};

// Build the reverse lookup map
Object.entries(US_CITIES_BY_STATE).forEach(([state, cities]) => {
  cities.forEach(city => {
    const normalizedCity = city.toLowerCase();
    if (!CITY_TO_STATES_MAP[normalizedCity]) {
      CITY_TO_STATES_MAP[normalizedCity] = [];
    }
    CITY_TO_STATES_MAP[normalizedCity].push(state);
  });
});

/**
 * Get the state abbreviation for a US city
 * @param {string} cityName - The city name
 * @param {number} lat - Latitude (optional, for disambiguation)
 * @param {number} lon - Longitude (optional, for disambiguation)
 * @returns {string|null} State abbreviation or null if not found
 */
export const getStateForUSCity = (cityName, lat = null, lon = null) => {
  if (!cityName || typeof cityName !== 'string') return null;
  
  const normalizedCity = cityName.toLowerCase().trim();
  const possibleStates = CITY_TO_STATES_MAP[normalizedCity];
  
  if (!possibleStates || possibleStates.length === 0) {
    return null;
  }
  
  // If only one state, return it
  if (possibleStates.length === 1) {
    return possibleStates[0];
  }
  
  // If coordinates are provided, use them for disambiguation
  if (lat !== null && lon !== null) {
    return disambiguateByCoordinates(normalizedCity, possibleStates, lat, lon);
  }
  
  // Return the first match as fallback
  return possibleStates[0];
};

/**
 * Disambiguate cities with same name using coordinates
 * This uses rough geographic regions to determine the most likely state
 */
const disambiguateByCoordinates = (cityName, possibleStates, lat, lon) => {
  // Define rough geographic regions for common ambiguous cities
  const stateRegions = {
    // Geographic center points for disambiguation
    'AL': { lat: 32.7, lon: -86.8 },
    'AK': { lat: 64.0, lon: -153.0 },
    'AZ': { lat: 34.2, lon: -111.7 },
    'AR': { lat: 34.8, lon: -92.2 },
    'CA': { lat: 36.8, lon: -119.4 },
    'CO': { lat: 39.0, lon: -105.5 },
    'CT': { lat: 41.6, lon: -72.7 },
    'DE': { lat: 39.0, lon: -75.5 },
    'FL': { lat: 27.8, lon: -81.7 },
    'GA': { lat: 32.9, lon: -83.6 },
    'HI': { lat: 21.1, lon: -157.8 },
    'ID': { lat: 44.2, lon: -114.5 },
    'IL': { lat: 40.3, lon: -89.0 },
    'IN': { lat: 39.8, lon: -86.3 },
    'IA': { lat: 42.0, lon: -93.2 },
    'KS': { lat: 38.5, lon: -96.7 },
    'KY': { lat: 37.7, lon: -84.9 },
    'LA': { lat: 31.0, lon: -91.8 },
    'ME': { lat: 45.3, lon: -69.8 },
    'MD': { lat: 39.0, lon: -76.8 },
    'MA': { lat: 42.2, lon: -71.5 },
    'MI': { lat: 43.3, lon: -84.5 },
    'MN': { lat: 45.7, lon: -93.9 },
    'MS': { lat: 32.7, lon: -89.7 },
    'MO': { lat: 38.4, lon: -92.3 },
    'MT': { lat: 47.0, lon: -110.0 },
    'NE': { lat: 41.1, lon: -98.0 },
    'NV': { lat: 38.3, lon: -117.1 },
    'NH': { lat: 43.4, lon: -71.5 },
    'NJ': { lat: 40.3, lon: -74.5 },
    'NM': { lat: 34.8, lon: -106.2 },
    'NY': { lat: 42.2, lon: -74.9 },
    'NC': { lat: 35.6, lon: -79.8 },
    'ND': { lat: 47.5, lon: -99.8 },
    'OH': { lat: 40.3, lon: -82.8 },
    'OK': { lat: 35.6, lon: -96.9 },
    'OR': { lat: 44.6, lon: -122.0 },
    'PA': { lat: 40.6, lon: -77.2 },
    'RI': { lat: 41.6, lon: -71.5 },
    'SC': { lat: 33.8, lon: -80.9 },
    'SD': { lat: 44.2, lon: -99.8 },
    'TN': { lat: 35.7, lon: -86.7 },
    'TX': { lat: 31.1, lon: -97.5 },
    'UT': { lat: 40.1, lon: -111.9 },
    'VT': { lat: 44.0, lon: -72.7 },
    'VA': { lat: 37.8, lon: -78.2 },
    'WA': { lat: 47.4, lon: -121.5 },
    'WV': { lat: 38.5, lon: -80.9 },
    'WI': { lat: 44.3, lon: -89.6 },
    'WY': { lat: 42.8, lon: -107.3 },
    'DC': { lat: 38.9, lon: -77.0 }
  };
  
  // Find the closest state by distance
  let closestState = possibleStates[0];
  let minDistance = Infinity;
  
  possibleStates.forEach(state => {
    const stateCenter = stateRegions[state];
    if (stateCenter) {
      const distance = Math.sqrt(
        Math.pow(lat - stateCenter.lat, 2) + Math.pow(lon - stateCenter.lon, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestState = state;
      }
    }
  });
  
  return closestState;
};

/**
 * Infer the nearest US state using raw coordinates.
 * Useful when a city is not present in the mapping but we still want
 * to display "City, ST" for geolocated results.
 * @param {number} lat
 * @param {number} lon
 * @returns {string|null} Two-letter state code or null
 */
export const getNearestUSStateByCoordinates = (lat, lon) => {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;

  // Same centers used in disambiguation
  const stateCenters = {
    'AL': { lat: 32.7, lon: -86.8 },
    'AK': { lat: 64.0, lon: -153.0 },
    'AZ': { lat: 34.2, lon: -111.7 },
    'AR': { lat: 34.8, lon: -92.2 },
    'CA': { lat: 36.8, lon: -119.4 },
    'CO': { lat: 39.0, lon: -105.5 },
    'CT': { lat: 41.6, lon: -72.7 },
    'DE': { lat: 39.0, lon: -75.5 },
    'FL': { lat: 27.8, lon: -81.7 },
    'GA': { lat: 32.9, lon: -83.6 },
    'HI': { lat: 21.1, lon: -157.8 },
    'ID': { lat: 44.2, lon: -114.5 },
    'IL': { lat: 40.3, lon: -89.0 },
    'IN': { lat: 39.8, lon: -86.3 },
    'IA': { lat: 42.0, lon: -93.2 },
    'KS': { lat: 38.5, lon: -96.7 },
    'KY': { lat: 37.7, lon: -84.9 },
    'LA': { lat: 31.0, lon: -91.8 },
    'ME': { lat: 45.3, lon: -69.8 },
    'MD': { lat: 39.0, lon: -76.8 },
    'MA': { lat: 42.2, lon: -71.5 },
    'MI': { lat: 43.3, lon: -84.5 },
    'MN': { lat: 45.7, lon: -93.9 },
    'MS': { lat: 32.7, lon: -89.7 },
    'MO': { lat: 38.4, lon: -92.3 },
    'MT': { lat: 47.0, lon: -110.0 },
    'NE': { lat: 41.1, lon: -98.0 },
    'NV': { lat: 38.3, lon: -117.1 },
    'NH': { lat: 43.4, lon: -71.5 },
    'NJ': { lat: 40.3, lon: -74.5 },
    'NM': { lat: 34.8, lon: -106.2 },
    'NY': { lat: 42.2, lon: -74.9 },
    'NC': { lat: 35.6, lon: -79.8 },
    'ND': { lat: 47.5, lon: -99.8 },
    'OH': { lat: 40.3, lon: -82.8 },
    'OK': { lat: 35.6, lon: -96.9 },
    'OR': { lat: 44.6, lon: -122.0 },
    'PA': { lat: 40.6, lon: -77.2 },
    'RI': { lat: 41.6, lon: -71.5 },
    'SC': { lat: 33.8, lon: -80.9 },
    'SD': { lat: 44.2, lon: -99.8 },
    'TN': { lat: 35.7, lon: -86.7 },
    'TX': { lat: 31.1, lon: -97.5 },
    'UT': { lat: 40.1, lon: -111.9 },
    'VT': { lat: 44.0, lon: -72.7 },
    'VA': { lat: 37.8, lon: -78.2 },
    'WA': { lat: 47.4, lon: -121.5 },
    'WV': { lat: 38.5, lon: -80.9 },
    'WI': { lat: 44.3, lon: -89.6 },
    'WY': { lat: 42.8, lon: -107.3 },
    'DC': { lat: 38.9, lon: -77.0 },
  };

  let nearest = null;
  let min = Infinity;
  for (const [state, center] of Object.entries(stateCenters)) {
    const d = Math.sqrt(Math.pow(lat - center.lat, 2) + Math.pow(lon - center.lon, 2));
    if (d < min) {
      min = d;
      nearest = state;
    }
  }
  return nearest;
};

/**
 * Format a US city name with state abbreviation
 * @param {string} cityName - The city name
 * @param {string} state - The state abbreviation
 * @returns {string} Formatted city name with state
 */
export const formatUSCityWithState = (cityName, state) => {
  if (!cityName || !state) return cityName || '';
  return `${cityName}, ${state}`;
};

/**
 * Check if a city name appears to be in the US based on our database
 * @param {string} cityName - The city name to check
 * @returns {boolean} True if the city is found in our US database
 */
export const isUSCity = (cityName) => {
  if (!cityName || typeof cityName !== 'string') return false;
  const normalizedCity = cityName.toLowerCase().trim();
  return CITY_TO_STATES_MAP.hasOwnProperty(normalizedCity);
};
