SELECT
    cc.*
FROM
    chat_channel cc
WHERE
   -- L'utilisateur connecté est un Customer
    cc.customer_id = '9f1f1c13-d22d-41c9-8823-a02233b9339c'
   OR
   -- OU l'utilisateur connecté est un ALP
    cc.alp_id = '9f1f1c13-d22d-41c9-8823-a02233b9339c';