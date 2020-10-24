## Thoughts on UI and Application state

You can represent your UI as a combination of two things:

an application state that represents a snapshot of reality at a given point in time
a set of pure functions that will always render the same output given the Application State

Of course there might be other environmental factors that can modify the output of your UI functions, like the current time, locale or the browser version etc. but as long as they are insignificant you can treat them as either additional input or a bit of noise in this representation.

So your UI is what the pure functions return given the fixed Application State as input.
And your UX is a set of manipulations on the Application state that consequently change the UI.

These manipulations can also be described as transitions between different application states, because unlike the state itself the transitions often have a time element. Additionally these transitions often get distorted by noise, like network errors, server errors or outages etc. So your transition from one state to the next is not pure, given the same input it might have different outputs - you could also call these side-effects.

You probably want your UI to reflect some of these transitions and their side-effects, but do they belong to your application state?

You have two choices, either keep the integrity of the application state or the purity of the UI. You cannot keep both.

If you want to keep the purity of the UI it means the changes you want to represent will have to be in the Application state. But this means your application state loses its integrity because if you store it and reload it later, it does not accurately represent the current state of reality (you are not transitioning anymore because your transition got interrupted).
To minimize this you could try to mark your transition states and clear or reset them when you store/restore an Application state.

If you want to keep the integrity of your application state, you lose the purity of your UI. It is now rendering a different output given the same input.
You could minimize this by encapsulating the impurities and keep the pure UI functions intact.

But what you can also do is a slight combination of the two: by differentiating between Application state (AS) and Transition state (TS). This way your UI stays pure, but instead of one input it takes two: the Application state AND the Transition state.

Ideally you should try to separate the components that react to Application state from the ones that react to Transition state for better testability. Or at least you want to somehow mark the types of inputs a component takes to make sure you are testing it correctly.

If you can separate the representation of the Application state with a "pure" component and add an external or encapsulated mutator to it which will represent the Transition state you can effectively test the two independently and more reliably.

## performance considerations

If you are using a state management tool like Redux then you will face the problem that if you put things in the same store that change often and independently from each other you will have too many re-renders throughout our application.

You always have to take into consideration that if anything changes in the store then all the components that are relying on any data from the store will have to re-evaluate their output. Of course there is a good middle layer that will make these re-evaluations fairly inexpensive, but it still makes sense to keep unstable things (that change too often) out of the Application state.
