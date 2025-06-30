import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to Dual N-Back Training
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
        Train your working memory with this scientifically proven cognitive exercise. 
        Start with Dual mode and progress to Quad and Penta for greater challenges.
      </p>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Dual Mode</h3>
          <p className="text-muted-foreground mb-4">
            Visual position and audio letter streams. Perfect for beginners.
          </p>
          <Link 
            to="/game?mode=DUAL" 
            className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Start Dual
          </Link>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Quad Mode</h3>
          <p className="text-muted-foreground mb-4">
            Adds color blink and pitch tone to Dual mode for increased difficulty.
          </p>
          <Link 
            to="/game?mode=QUAD" 
            className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Start Quad
          </Link>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Penta Mode</h3>
          <p className="text-muted-foreground mb-4">
            Ultimate challenge with all five stimulus streams active.
          </p>
          <Link 
            to="/game?mode=PENTA" 
            className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Start Penta
          </Link>
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <Link 
          to="/progress" 
          className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md hover:bg-secondary/80 transition-colors"
        >
          View Progress
        </Link>
        <Link 
          to="/settings" 
          className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md hover:bg-secondary/80 transition-colors"
        >
          Settings
        </Link>
      </div>
    </div>
  )
} 