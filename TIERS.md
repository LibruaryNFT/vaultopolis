# TopShot Tiers Commands Reference

## Tiers Contract Commands

### get_tier
- **Description**: Retrieves the tier of a specific moment.
- **Notes**: Make sure the momentID exists in the specified account to avoid errors.
- **Input Parameters**:
    - `account: Address` - The Flow account address (e.g., 0xf8d6e0586b0a20c7).
    - `momentID: UInt32` - The ID of the moment you want to query.
- **Example Usage**:

```bash
flow-c1 scripts execute ./tiers/scripts/get_tier.cdc 0xf8d6e0586b0a20c7 1
```

### update_default_tier
- **Description**: Updates the default tier for a specific set.
- **Notes**: This command requires admin privileges to execute.
- **Input Parameters**:
  - `setID: UInt32` - The ID of the set you want to update.
  - `tierRawValue: UInt8` - The new tier value to set (e.g., 2 for Rare).
- **Example Usage**:

  ```bash
  flow-c1 transactions send ./tiers/transactions/update_default_tier.cdc 1 2

### update_mixed_tier
- **Description**: Updates the tier for a specific play within a set.
- **Notes**: Ensure both the `setID` and `playID` exist and are correct before running this command.
- **Input Parameters**:
  - `setID: UInt32` - The ID of the set containing the play.
  - `playID: UInt32` - The ID of the play you want to update.
  - `tierRawValue: UInt8` - The new tier value to assign to the play.
- **Example Usage**:

  ```bash
  flow-c1 transactions send ./tiers/transactions/update_mixed_tier.cdc 1 245 3

### remove_playid
- **Description**: Removes a play from a specific set.
- **Notes**: This command permanently removes the association between the play and the set.
- **Input Parameters**:
  - `setID: UInt32` - The ID of the set you want to modify.
  - `playID: UInt32` - The ID of the play to remove from the set.
- **Example Usage**:

  ```bash
  flow-c1 transactions send ./tiers/transactions/remove_playid.cdc 1 245

## Set Tiers Reference

The following is a detailed reference to the various set tiers available in TopShot. Each tier corresponds to a specific rarity level or categorization.

1. Ultimate
2. Common
3. Ultimate
4. Legendary
5. Rare
6. Rare
7. Rare
8. Legendary
9. Rare
10. Rare
11. Rare
12. Legendary
13. Rare
14. Common
15. Rare
16. Rare
17. Rare
18. Rare
19. Rare
20. Legendary
21. Rare
22. Common
23. Legendary
24. Rare
25. Rare
26. Common
27. Ultimate
28. Legendary
29. Rare
30. Rare
31. Legendary
32. Common
33. Common
34. Common
35. Rare
36. Common
37. Hustle and Show
38. Rare
39. Common
40. Rare
41. Legendary
42. Ultimate
43. Fandom
44. Common
45. Fandom
46. Rare
47. Rare
48. Common
49. Fandom
50. Legendary
51. Common
52. Ultimate
53. Legendary
54. Rare
55. Rare
56. Fandom
57. Legendary
58. Common
59. Common
60. Common
61. Legendary
62. Fandom
63. Rare
64. Rare
65. Common
66. Fandom
67. Common
68. Rare
69. Legendary
70. Fandom
71. Rare
72. Common
73. Common
74. Legendary 2648, 2649, 2837
75. Rare 2650, 2651
76. Rare
77. Fandom
78. Fandom
79. Fandom
80. Rare
81. Fandom
82. Rare
83. Legendary
84. Rare
85. Common
86. Rare
87. Fandom
88. Fandom
89. Fandom
90. Rare
91. Common
92. Common
93. Common
94. Rare
95. Rare
96. Rare
97. Legendary
98. Rare
99. Common
100. Rare
101. Legendary 3345, 3919, 5304
102. Rare 4163, 5301
103. Fandom
104. Rare
105. Legendary
106. Common
107. Common
108. Legendary
109. Fandom
110. Common
111. Legendary 3938, 5299
112. Rare 4162, 5300
113. Legendary
114. Common
115. Rare
116. Common
117. Legendary 3938, 5299
118. Rare 4162, 5300
119. Rare
120. Legendary
121. Legendary 4126, 4128, 5305
122. Rare 4124, 4125, 4127, 5306
123. Legendary
124. Common
125. Rare
126. Legendary
127. Legendary
128. Legendary
129. Common
130. Common
131. Common
132. Rare
133. Rare
134. Common
135. Rare
136. Legendary
137. Common
138. Common
139. Rare
140. Rare
141. Rare
142. Common
143. Fandom
144. Legendary
145. Ultimate
146. Fandom 5149, 5150, 5151, 5152, 5153, 5154, 5155, 5156, 5157, 5158, 5159, 5160, 5161, 5162, 5163, 5164, 5165, 5166, 5167, 5168, 5169, 5170, 5171, 5172, 5173, 5174, 5175, 5176, 5194, 5195, 5196, 5197
147. Rare 5177, 5178, 5179, 5180, 5181, 5182, 5183, 5184, 5185, 5186, 5187, 5188, 5189, 5190, 5192, 5193
148. Rare
149. Fandom
150. Common
151. Common
152. Rare
153. Legendary
154. Rare
155. Rare
156. Rare
157. Ultimate
158. Rare
159. Legendary
