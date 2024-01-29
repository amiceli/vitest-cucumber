import {
    VueWrapper,
    flushPromises, mount,
} from "@vue/test-utils"
import {
    expect, vi,
} from "vitest"
import {
    describeFeature, loadFeature,
} from "@amiceli/vitest-cucumber"
import ChannelsVue from "@/modules/channels/list/Channels.vue"
import { ChannelRepository } from "@/domain/channels/ChannelRepository"
import ChannelPreviewVue from "@/modules/channels/list/ChannelPreview.vue"
import {
    $settings, clearSettings,
} from "@/modules/settings/settingsStore"

const channelsPage = await loadFeature(`features/gherkin-example.feature`)

describeFeature(channelsPage, ({ Scenario, ScenarioOutline, BeforeEachScenario }) => {

    let repository : ChannelRepository

    BeforeEachScenario(() => {
        vi.clearAllMocks()

        clearSettings()
        repository = ChannelRepository.withApiUrl(``)
        vi
            .spyOn(ChannelRepository, `withApiUrl`)
            .mockReturnValue(repository)
    })

    Scenario(`User on home page`, ({ Given, Then }) => {
        let wrapper : VueWrapper

        Given(`User on home channels page`, async () => {
            vi.spyOn(repository, `loadChannels`)
                .mockImplementation(() => Promise.resolve([
                    {
                        xmlId : `test`,
                        displayName : `test`,
                        icon : null,
                        brightness : 0,
                    },
                ]))
            wrapper = mount(ChannelsVue)
            await flushPromises()
            await wrapper.vm.$nextTick()
        })
        Then(`I see all channels`, () => {
            expect(
                wrapper.findAllComponents(ChannelPreviewVue),
            ).toHaveLength(1)
        })
    })

    ScenarioOutline(`User loved channels`, ({ Given, When, Then, And }, variables) => {
        let wrapper : VueWrapper

        Given(`User on home page`, async () => {
            vi.spyOn(repository, `loadChannels`)
                .mockImplementation(() => Promise.resolve([
                    {
                        xmlId : variables[`channel-name`],
                        displayName : variables[`channel-name`],
                        icon : null,
                        brightness : 0,
                    },
                ]))
            wrapper = mount(ChannelsVue)
            await flushPromises()
            await wrapper.vm.$nextTick()
        })
        When(`I click on heart icon for <channel-name>`, async () => {
            await wrapper.find(`.lni-heart`).trigger(`click`)
            await wrapper.vm.$nextTick()
        })
        Then(`I see full heart icon`, async () => {
            expect(
                wrapper.find(`.lni-heart-fill`).exists(),
            ).toBe(true)
        })
        And(`I can see <channel-name> on "loved channels" page`, async () => {
            const buttons = wrapper.findAll(`.tivu-choose span`)
            await buttons[1].trigger(`click`)
            await wrapper.vm.$nextTick()

            expect(
                wrapper.findAllComponents(ChannelPreviewVue),
            ).toHaveLength(1)
            expect(
                $settings.value?.channelIsHearted(variables[`channel-name`]),
            ).toBe(true)
        })
    })

    ScenarioOutline(`Hide hidden channels`, ({ Given, When, Then, But }, variables) => {
        let wrapper : VueWrapper

        Given(`User chose to hide <channel-name>`, async () => {
            localStorage.setItem(`tivu.settings`, JSON.stringify({
                channels : {
                    [variables[`channel-name`]] : {
                        heart : false, hidden : true,
                    },
                },
            }))
            vi.spyOn(repository, `loadChannels`)
                .mockImplementation(() => Promise.resolve([
                    {
                        xmlId : variables[`channel-name`],
                        displayName : variables[`channel-name`],
                        icon : null,
                        brightness : 0,
                    },
                    {
                        xmlId : `test`, displayName : `test`, icon : null, brightness : 0,
                    },
                ]))
        })
        When(`I go to home page`, async () => {
            wrapper = mount(ChannelsVue)
            await flushPromises()
            await wrapper.vm.$nextTick()
        })
        Then(`I see all channels`, () => {
            expect(
                wrapper.findAllComponents(ChannelPreviewVue),
            ).toHaveLength(1)
        })
        But(`I don't see <channel-name>`, () => {
            expect(
                $settings.value?.channelIsHidden(variables[`channel-name`]),
            ).toBe(true)
        })
    })

})
