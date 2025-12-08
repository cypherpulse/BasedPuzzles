# PowerShell script to commit all untracked files with individual commit messages
# This script commits all changes for the Based Puzzles frontend project on Base Blockchain

# Get all untracked files
$files = git ls-files --others --exclude-standard

# Base message template
$baseMessage = "Added {0} for Based Puzzles - Base-native web game hub with Sudoku and Crossword puzzles, track best times, climb leaderboards, Base Mini App, Smart Wallet connect for onchain identity and NFT rewards on Base blockchain"

foreach ($file in $files) {
    Write-Host "Committing $file..."
    git add $file
    $message = $baseMessage -f $file
    git commit -m $message
    git push
    Write-Host "Committed and pushed $file"
}

Write-Host "All changes committed individually and pushed. Ready to showcase contributions to Based Puzzles on Base blockchain with puzzle games, leaderboards, and onchain rewards."