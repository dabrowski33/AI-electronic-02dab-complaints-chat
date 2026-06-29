package com.nbp.copilot;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.ai.openai.api-key=test-key",
        "spring.ai.openai.base-url=https://openrouter.ai/api/v1"
})
class CopilotApplicationTests {

    @Test
    void contextLoads() {
    }
}
