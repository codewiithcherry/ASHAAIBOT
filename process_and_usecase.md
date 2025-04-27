# ASHAAIBOT Process Flow and Use-Case Diagrams

## Process Flow Diagram
```mermaid
graph TD
    Start((Start)) --> UserInput[User Inputs Query]
    UserInput --> NLP[Natural Language Processing]
    NLP --> IntentCheck{Intent Recognition}
    
    IntentCheck -->|Jobs| JobsFlow[Jobs Process]
    IntentCheck -->|Events| EventsFlow[Events Process]
    IntentCheck -->|Mentorship| MentorFlow[Mentorship Process]
    IntentCheck -->|FAQ| FAQFlow[FAQ Process]
    IntentCheck -->|Profile| ProfileFlow[Profile Process]
    
    JobsFlow --> SearchJobs[Search Jobs]
    SearchJobs --> FilterResults[Filter Results]
    FilterResults --> DisplayJobs[Display Jobs]
    
    EventsFlow --> FetchEvents[Fetch Events]
    FetchEvents --> FilterEvents[Filter Events]
    FilterEvents --> DisplayEvents[Display Events]
    
    MentorFlow --> FetchMentors[Fetch Mentors]
    FetchMentors --> MatchMentors[Match Mentors]
    MatchMentors --> DisplayMentors[Display Mentors]
    
    FAQFlow --> SearchKB[Search Knowledge Base]
    SearchKB --> GenerateResponse[Generate Response]
    
    ProfileFlow --> ValidateUser[Validate User]
    ValidateUser --> UpdateProfile[Update Profile]
    
    DisplayJobs --> Response[Generate Response]
    DisplayEvents --> Response
    DisplayMentors --> Response
    GenerateResponse --> Response
    UpdateProfile --> Response
    
    Response --> UserOutput[Display to User]
    UserOutput --> Feedback{User Feedback}
    
    Feedback -->|Satisfied| End((End))
    Feedback -->|Not Satisfied| Refine[Refine Response]
    Refine --> NLP
```

## Use-Case Diagram
```mermaid
graph TD
    subgraph "ASHAAIBOT System"
        JobSearch[Search Jobs]
        EventBrowse[Browse Events]
        MentorMatch[Find Mentors]
        FAQHandle[Handle FAQs]
        ProfileManage[Manage Profile]
        Auth[Authentication]
    end
    
    subgraph "Users"
        User((Job Seeker))
        Admin((Admin))
    end
    
    subgraph "External Systems"
        JobDB[(Job Database)]
        EventDB[(Event Database)]
        MentorDB[(Mentor Database)]
        KnowledgeBase[(Knowledge Base)]
    end
    
    User --> Auth
    User --> JobSearch
    User --> EventBrowse
    User --> MentorMatch
    User --> FAQHandle
    User --> ProfileManage
    
    Admin --> Auth
    Admin --> KnowledgeBase
    
    JobSearch --> JobDB
    EventBrowse --> EventDB
    MentorMatch --> MentorDB
    FAQHandle --> KnowledgeBase
    ProfileManage --> Auth
```

## Key Process Flows

### 1. Job Search Process
- User inputs job-related query
- System processes natural language input
- Searches job database with relevant filters
- Returns matched job listings
- Handles user feedback and refinement

### 2. Event Discovery Process
- User requests event information
- System categorizes event type
- Filters based on user preferences
- Presents relevant events
- Handles registration queries

### 3. Mentorship Matching Process
- User requests mentorship
- System analyzes user profile
- Matches with available mentors
- Presents mentor profiles
- Facilitates connection process

### 4. FAQ Handling Process
- User asks question
- System categorizes query
- Searches knowledge base
- Generates contextual response
- Learns from user feedback

### 5. Profile Management Process
- User requests profile update
- System validates user
- Processes update request
- Confirms changes
- Updates related systems

## Interaction Points

### User Interactions
- Natural language queries
- Profile updates
- Feedback submission
- Search refinement
- Response rating

### System Responses
- Job recommendations
- Event suggestions
- Mentor matches
- FAQ answers
- Profile confirmations

### Data Management
- Query processing
- Response generation
- User data handling
- Session management
- Feedback processing 