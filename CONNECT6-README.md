# Connect-6 Matching System

Connect-6 is an AI-powered project matching system that connects users with the most relevant projects based on their skills, interests, and preferences. The system uses a sophisticated algorithm to score and rank projects, providing personalized recommendations.

## Features

- **AI-Powered Matching**: Uses Google Gemini 1.5 Flash embeddings to understand the semantic similarity between skills and interests
- **Multi-factor Scoring**: Evaluates matches based on 6 key factors:
  1. Skills match (35%)
  2. Interest alignment (15%)
  3. Experience level (15%)
  4. Work mode preference (10%)
  5. Availability/Timezone (10%)
  6. Team fit metrics (15%)
- **Explainable Results**: Provides detailed explanations for why each project was recommended
- **Diversity Optimization**: Ensures a diverse set of recommendations across different project categories
- **Performance Optimization**: Uses Redis caching to improve response times and reduce API costs

## Architecture

The Connect-6 system consists of:

1. **Backend Cloud Functions**:
   - `connect6Match`: Main matching function that scores and ranks projects
   - `connect6MatchExplain`: Provides detailed explanations for match results
   - `connect6BatchUpdate`: Admin function to update matches for multiple users

2. **Frontend Components**:
   - `Connect6Matching.tsx`: React component for displaying and filtering match results
   - Integration with the main application navigation

## Setup Instructions

### Backend Setup

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Google API key for Gemini
   - Add Redis URL (optional)

3. Deploy functions:
   ```bash
   npm run deploy
   ```

### Frontend Setup

No additional setup is required for the frontend as all necessary components are included in the main application.

## Usage

1. Navigate to the Connect-6 matching page via the AI Services menu
2. Apply filters to refine your project search
3. Click "Find Matches" to generate personalized project recommendations
4. Click "Why?" on any match to see a detailed explanation of the match score
5. Click "View Project" to see the full project details

## Technical Details

### Matching Algorithm

The Connect-6 matching algorithm works in the following steps:

1. **Data Collection**: Retrieves user profile and available projects
2. **Embedding Generation**: Creates vector embeddings for skills and interests using Google Gemini
3. **Factor Scoring**: Calculates scores for each of the 6 factors
4. **Weighted Combination**: Combines factor scores using predefined weights
5. **Diversity Reranking**: Ensures diversity in the final recommendations
6. **Result Storage**: Saves matches to Firestore for future reference

### Performance Considerations

- Embeddings are cached in Redis to reduce API calls and improve response times
- Batch processing is available for updating matches for multiple users
- Firestore composite indexes are used for efficient filtering

## Future Enhancements

- **Advanced Timezone Matching**: More sophisticated timezone compatibility scoring
- **Learning from Feedback**: Incorporating user feedback to improve match quality
- **Team Composition Analysis**: Evaluating how well users would work together on a team
- **Project Success Prediction**: Predicting the likelihood of project success based on team composition 