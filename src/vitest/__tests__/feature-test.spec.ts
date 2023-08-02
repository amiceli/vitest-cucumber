// import {
//     initializeFeature
// } from '../index'
// import {
//     describe, it, expect, test, vi, beforeEach
// } from 'vitest'

// const path = 'examples/index.feature'
// const featureTest = await initializeFeature(path)

// describe('FeatureTest', async () => {

//     beforeEach(() => {
//         vi.clearAllMocks()
//     })

//     it('should detect bad feature name', () => {
//         const displayError = vi.spyOn(featureTest, 'displayError')

//         featureTest.describe('test', () => {

//         })

//         expect(displayError).toHaveBeenCalledWith('Incorrect feature title')
//     })

// })


// try {
//     featureTest.describe('Use Gherkin in my unit tests', ({ Scenario }) => {
//         Scenario('zob', () => {
//             expect(true).toBeFalsy()
//         })
//     })
// } catch (e) {
//     console.error('la : ', e)
// }