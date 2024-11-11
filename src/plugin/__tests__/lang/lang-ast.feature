Fonctionnalité: vitest-cucumber à la française
    Contexte:
        Étant donné Le fichier gherkin est "src/__tests__/scenario-ast.feature"
        Et Le fichier de tests est "src/__tests__/scenario-ast.spec.ts"

    Scénario: Ajouter une step à un scenario
        Étant donné Le scénario a un "Given"
        """
            Fonctionnalité: exemple
                Scénario: test
                    Étant donné Je suis la seule step
        """
        Quand J'ajoute un "Then"
        """
            Fonctionnalité: exemple
                Scénario: test
                    Étant donné Je suis la seule step
                    Alors Tout va bien
        """
        Alors Le scénario "test" a 2 staps
