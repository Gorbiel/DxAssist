# scheduler 

Loading configuration from config.yaml and orchestrating calls to the models. In case of single it's simple - just call the model with proper data from backend, retrieve the output and return it to the backend. In case of combined the situation is a bit more complex. Logic is in handle_combined_mode method, which implements process that works that way: 

1. Get the data from the backend WITH (without is also possible but better the initial with) data for the first model

2. Call the first model with the data and get the output

3. Send a request to backend to get the data for the second model

4. Call the second model with the data and get the output

5. Repeat until all models are called

6. Return the output to the backend

Now, what's output: for now I'm searching for common_numeric_fields in the output of all of the models and then combining the probabilies with weights and returning the result to backend.

It'll need an absolute change of this logic, but for prototype it's ok.

